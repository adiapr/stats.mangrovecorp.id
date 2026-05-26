<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use MongoDB\BSON\UTCDateTime;

class GeografiController extends Controller
{
    public function index(Request $request)
    {
        $period      = $request->input('period', 'this_month');
        $customStart = $request->input('start');
        $customEnd   = $request->input('end');

        [$start, $end] = $this->resolvePeriod($period, $customStart, $customEnd);

        $cacheKey = "geografi:{$period}:{$start->toDateString()}:{$end->toDateString()}";
        $data = Cache::remember($cacheKey, 5, fn () => $this->fetchAll($start, $end));

        return Inertia::render('geografi', [
            'period'      => $period,
            'periodStart' => $start->toDateString(),
            'periodEnd'   => $end->toDateString(),
            ...$data,
        ]);
    }

    // ── Core Data Fetch ───────────────────────────────────────────────────

    private function fetchAll(Carbon $start, Carbon $end): array
    {
        return [
            'mkl' => $this->mklGeografi($start, $end),
            'idp' => $this->idpGeografi($start, $end),
        ];
    }

    // ── Makenliving (MySQL) ───────────────────────────────────────────────

    private function mklGeografi(Carbon $start, Carbon $end): array
    {
        // Province ranking
        $provinceRows = DB::table('orders')
            ->join('addresses', 'orders.address_id', '=', 'addresses.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('addresses.province')
            ->where('addresses.province', '!=', '')
            ->select(
                'addresses.province',
                DB::raw('count(*) as orders'),
                DB::raw('sum(orders.total_price) as revenue'),
            )
            ->groupBy('addresses.province')
            ->orderByDesc('orders')
            ->get();

        $totalOrders  = (int) $provinceRows->sum('orders');
        $totalRevenue = (int) $provinceRows->sum('revenue');

        $provinces = $provinceRows->map(fn ($r) => [
            'province' => (string) ($r->province ?? 'Tidak Diketahui'),
            'orders'   => (int) $r->orders,
            'revenue'  => (int) $r->revenue,
            'share'    => $totalOrders > 0 ? round($r->orders / $totalOrders * 100, 1) : 0,
        ])->values()->toArray();

        // City ranking (top 50)
        $cityRows = DB::table('orders')
            ->join('addresses', 'orders.address_id', '=', 'addresses.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('addresses.city')
            ->where('addresses.city', '!=', '')
            ->select(
                'addresses.province',
                'addresses.city',
                DB::raw('count(*) as orders'),
                DB::raw('sum(orders.total_price) as revenue'),
            )
            ->groupBy('addresses.province', 'addresses.city')
            ->orderByDesc('orders')
            ->limit(50)
            ->get();

        $cities = $cityRows->map(fn ($r) => [
            'province' => (string) ($r->province ?? 'Tidak Diketahui'),
            'city'     => (string) ($r->city ?? 'Tidak Diketahui'),
            'orders'   => (int) $r->orders,
            'revenue'  => (int) $r->revenue,
            'share'    => $totalOrders > 0 ? round($r->orders / $totalOrders * 100, 1) : 0,
        ])->values()->toArray();

        // District ranking (top 30)
        $districtRows = DB::table('orders')
            ->join('addresses', 'orders.address_id', '=', 'addresses.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('addresses.district')
            ->where('addresses.district', '!=', '')
            ->select(
                'addresses.province',
                'addresses.city',
                'addresses.district',
                DB::raw('count(*) as orders'),
                DB::raw('sum(orders.total_price) as revenue'),
            )
            ->groupBy('addresses.province', 'addresses.city', 'addresses.district')
            ->orderByDesc('orders')
            ->limit(30)
            ->get();

        $districts = $districtRows->map(fn ($r) => [
            'province' => (string) ($r->province ?? 'Tidak Diketahui'),
            'city'     => (string) ($r->city ?? 'Tidak Diketahui'),
            'district' => (string) ($r->district ?? 'Tidak Diketahui'),
            'orders'   => (int) $r->orders,
            'revenue'  => (int) $r->revenue,
            'share'    => $totalOrders > 0 ? round($r->orders / $totalOrders * 100, 1) : 0,
        ])->values()->toArray();

        return [
            'provinces'    => $provinces,
            'cities'       => $cities,
            'districts'    => $districts,
            'totalOrders'  => $totalOrders,
            'totalRevenue' => $totalRevenue,
        ];
    }

    // ── IDPhotobook (MongoDB) ─────────────────────────────────────────────

    private function idpGeografi(Carbon $start, Carbon $end): array
    {
        $col    = DB::connection('mongodb_remote')->getDatabase()->selectCollection('orders');
        $mStart = new UTCDateTime((int) ($start->getTimestamp() * 1000));
        $mEnd   = new UTCDateTime((int) ($end->getTimestamp() * 1000));

        $matchStage = ['$match' => ['createdAt' => ['$gte' => $mStart, '$lte' => $mEnd]]];

        // Province aggregation
        $provCursor = $col->aggregate([
            $matchStage,
            ['$match' => ['personal_detail.province' => ['$exists' => true, '$nin' => [null, '']]]],            ['$group' => [
                '_id'     => '$personal_detail.province',
                'orders'  => ['$sum' => 1],
                'revenue' => ['$sum' => '$total_payment'],
            ]],
            ['$sort' => ['orders' => -1]],
        ]);

        $provRows = collect(iterator_to_array($provCursor));

        // recalculate totals properly
        $totalOrdersCalc  = 0;
        $totalRevenueCalc = 0;
        $provData = [];
        foreach ($provRows as $item) {
            $row = (array) $item;
            $o = (int) ($row['orders'] ?? 0);
            $r = (int) ($row['revenue'] ?? 0);
            $totalOrdersCalc  += $o;
            $totalRevenueCalc += $r;
            $provData[] = ['province' => (string) ($row['_id'] ?? 'Tidak Diketahui'), 'orders' => $o, 'revenue' => $r];
        }

        $provinces = array_map(fn ($p) => [
            ...$p,
            'share' => $totalOrdersCalc > 0 ? round($p['orders'] / $totalOrdersCalc * 100, 1) : 0,
        ], $provData);

        // City aggregation (top 50)
        $cityCursor = $col->aggregate([
            $matchStage,
            ['$match' => ['personal_detail.city' => ['$exists' => true, '$nin' => [null, '']]]],            ['$group' => [
                '_id'     => ['province' => '$personal_detail.province', 'city' => '$personal_detail.city'],
                'orders'  => ['$sum' => 1],
                'revenue' => ['$sum' => '$total_payment'],
            ]],
            ['$sort' => ['orders' => -1]],
            ['$limit' => 50],
        ]);

        $cities = [];
        foreach (iterator_to_array($cityCursor) as $item) {
            $row = (array) $item;
            $id  = (array) ($row['_id'] ?? []);
            $o   = (int) ($row['orders'] ?? 0);
            $r   = (int) ($row['revenue'] ?? 0);
            $cities[] = [
                'province' => (string) ($id['province'] ?? 'Tidak Diketahui'),
                'city'     => (string) ($id['city'] ?? 'Tidak Diketahui'),
                'orders'   => $o,
                'revenue'  => $r,
                'share'    => $totalOrdersCalc > 0 ? round($o / $totalOrdersCalc * 100, 1) : 0,
            ];
        }

        // District aggregation (top 30)
        $distCursor = $col->aggregate([
            $matchStage,
            ['$match' => ['personal_detail.district' => ['$exists' => true, '$nin' => [null, '']]]],            ['$group' => [
                '_id'     => [
                    'province' => '$personal_detail.province',
                    'city'     => '$personal_detail.city',
                    'district' => '$personal_detail.district',
                ],
                'orders'  => ['$sum' => 1],
                'revenue' => ['$sum' => '$total_payment'],
            ]],
            ['$sort' => ['orders' => -1]],
            ['$limit' => 30],
        ]);

        $districts = [];
        foreach (iterator_to_array($distCursor) as $item) {
            $row = (array) $item;
            $id  = (array) ($row['_id'] ?? []);
            $o   = (int) ($row['orders'] ?? 0);
            $r   = (int) ($row['revenue'] ?? 0);
            $districts[] = [
                'province' => (string) ($id['province'] ?? 'Tidak Diketahui'),
                'city'     => (string) ($id['city'] ?? 'Tidak Diketahui'),
                'district' => (string) ($id['district'] ?? 'Tidak Diketahui'),
                'orders'   => $o,
                'revenue'  => $r,
                'share'    => $totalOrdersCalc > 0 ? round($o / $totalOrdersCalc * 100, 1) : 0,
            ];
        }

        return [
            'provinces'    => $provinces,
            'cities'       => $cities,
            'districts'    => $districts,
            'totalOrders'  => $totalOrdersCalc,
            'totalRevenue' => $totalRevenueCalc,
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function resolvePeriod(string $period, ?string $customStart, ?string $customEnd): array
    {
        $now = Carbon::now();

        return match ($period) {
            'today'      => [Carbon::today(), Carbon::today()->endOfDay()],
            'yesterday'  => [Carbon::yesterday(), Carbon::yesterday()->endOfDay()],
            '7days'      => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            '30days'     => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
            'this_month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'last_month' => [
                $now->copy()->subMonthNoOverflow()->startOfMonth(),
                $now->copy()->subMonthNoOverflow()->endOfMonth(),
            ],
            '6months'    => [$now->copy()->subMonths(6)->startOfMonth(), $now->copy()->endOfMonth()],
            'this_year'  => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            'custom'     => [
                Carbon::parse($customStart)->startOfDay(),
                Carbon::parse($customEnd)->endOfDay(),
            ],
            default      => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };
    }
}
