<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period      = $request->input('period', 'this_month');
        $customStart = $request->input('start');
        $customEnd   = $request->input('end');

        [$start, $end]         = $this->resolvePeriod($period, $customStart, $customEnd);
        [$prevStart, $prevEnd] = $this->previousPeriod($start, $end);

        $singleDay = in_array($period, ['today', 'yesterday'])
            || ($period === 'custom' && $start->toDateString() === $end->toDateString());

        // Cache 5 detik — cukup untuk debounce double-request, tetap near-realtime
        $cacheKey = "analytics:{$period}:{$start->toDateString()}:{$end->toDateString()}";
        $data = Cache::remember($cacheKey, 5, fn () =>
            $this->fetchAll($start, $end, $prevStart, $prevEnd, $singleDay)
        );

        return Inertia::render('analytics', [
            'period'      => $period,
            'periodStart' => $start->toDateString(),
            'periodEnd'   => $end->toDateString(),
            'trendType'   => $singleDay ? 'hourly' : 'daily',
            ...$data,
        ]);
    }

    // ── Core Data Fetch ───────────────────────────────────────────────────

    private function fetchAll(
        Carbon $start, Carbon $end,
        Carbon $prevStart, Carbon $prevEnd,
        bool $singleDay
    ): array {
        $col    = \DB::connection('mongodb_remote')->getDatabase()->selectCollection('orders');
        $mStart = new UTCDateTime((int) ($start->getTimestamp() * 1000));
        $mEnd   = new UTCDateTime((int) ($end->getTimestamp() * 1000));
        $pStart = new UTCDateTime((int) ($prevStart->getTimestamp() * 1000));
        $pEnd   = new UTCDateTime((int) ($prevEnd->getTimestamp() * 1000));

        // ── A. Main period: KPI + Platform + Trend dalam 1 round-trip ─────
        $facetResult = iterator_to_array($col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $mStart, '$lte' => $mEnd]]],
            ['$facet' => [
                'kpi' => [
                    ['$group' => [
                        '_id'           => null,
                        'total_orders'  => ['$sum' => 1],
                        'paid_orders'   => ['$sum' => ['$cond' => [['$eq' => ['$is_paid', true]], 1, 0]]],
                        'total_revenue' => ['$sum' => '$total_payment'],
                    ]],
                ],
                'byPlatform' => [
                    ['$group' => ['_id' => ['$ifNull' => ['$platform', 'Lainnya']], 'count' => ['$sum' => 1]]],
                    ['$sort'  => ['count' => -1]],
                ],
                'byDay' => [
                    ['$group' => [
                        '_id'     => ['$dateToString' => ['format' => '%Y-%m-%d', 'date' => '$createdAt']],
                        'orders'  => ['$sum' => 1],
                        'revenue' => ['$sum' => '$total_payment'],
                    ]],
                    ['$sort' => ['_id' => 1]],
                ],
                'byHour' => [
                    ['$group' => [
                        '_id'     => ['$hour' => '$createdAt'],
                        'orders'  => ['$sum' => 1],
                        'revenue' => ['$sum' => '$total_payment'],
                    ]],
                    ['$sort' => ['_id' => 1]],
                ],
            ]],
        ]));

        $facet = (array) ($facetResult[0] ?? []);

        // Parse KPI
        $kpiItems     = $facet['kpi'] ? iterator_to_array($facet['kpi']) : [];
        $kpi          = $kpiItems ? (array) $kpiItems[0] : [];
        $totalOrders  = (int) ($kpi['total_orders']  ?? 0);
        $paidOrders   = (int) ($kpi['paid_orders']   ?? 0);
        $totalRevenue = (int) ($kpi['total_revenue'] ?? 0);

        // Parse Platform
        $platformData = collect($facet['byPlatform'] ? iterator_to_array($facet['byPlatform']) : [])
            ->map(fn ($item) => [
                'platform' => (string) ((array) $item)['_id'],
                'count'    => (int)    ((array) $item)['count'],
            ])
            ->values()->toArray();

        // Parse Trend
        if ($singleDay) {
            $hourBuckets = array_fill(0, 24, ['orders' => 0, 'revenue' => 0]);
            foreach ($facet['byHour'] ? iterator_to_array($facet['byHour']) : [] as $item) {
                $row = (array) $item;
                $hourBuckets[(int) $row['_id']] = [
                    'orders'  => (int) ($row['orders']  ?? 0),
                    'revenue' => (int) ($row['revenue'] ?? 0),
                ];
            }
            $dailyTrend = array_map(
                fn ($h, $d) => ['label' => str_pad($h, 2, '0', STR_PAD_LEFT) . ':00', 'orders' => $d['orders'], 'revenue' => $d['revenue']],
                array_keys($hourBuckets), array_values($hourBuckets)
            );
        } else {
            $dailyTrend = collect($facet['byDay'] ? iterator_to_array($facet['byDay']) : [])
                ->map(fn ($item) => [
                    'label'   => substr((string) ((array) $item)['_id'], 5),
                    'orders'  => (int) ((array) $item)['orders'],
                    'revenue' => (int) ((array) $item)['revenue'],
                ])
                ->values()->toArray();
        }

        // ── B. Periode sebelumnya: hanya total (1 round-trip) ─────────────
        $prevResult  = iterator_to_array($col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $pStart, '$lte' => $pEnd]]],
            ['$group' => ['_id' => null, 'total_orders' => ['$sum' => 1], 'total_revenue' => ['$sum' => '$total_payment']]],
        ]));
        $prev        = (array) ($prevResult[0] ?? []);
        $prevOrders  = (int) ($prev['total_orders']  ?? 0);
        $prevRevenue = (int) ($prev['total_revenue'] ?? 0);

        // ── C. 12 Order Terbaru ───────────────────────────────────────────
        $latestOrders = $this->fetchLatestOrders($col);

        // ── D. Leaderboard PIC (3 aggregations) ──────────────────────────
        $leaderboards = $this->buildPicLeaderboard($col, $mStart, $mEnd);

        // ── E. Derived metrics ────────────────────────────────────────────
        $orderGrowth   = $prevOrders  > 0 ? round((($totalOrders  - $prevOrders)  / $prevOrders)  * 100, 1) : 0;
        $revenueGrowth = $prevRevenue > 0 ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1) : 0;

        return [
            'kpi' => [
                'total_orders'    => $totalOrders,
                'total_revenue'   => $totalRevenue,
                'paid_orders'     => $paidOrders,
                'paid_rate'       => $totalOrders > 0 ? round(($paidOrders / $totalOrders) * 100, 1) : 0,
                'avg_order_value' => $totalOrders > 0 ? (int) round($totalRevenue / $totalOrders) : 0,
                'order_growth'    => $orderGrowth,
                'revenue_growth'  => $revenueGrowth,
            ],
            'platformData' => array_values($platformData),
            'dailyTrend'   => array_values($dailyTrend),
            'latestOrders' => array_values($latestOrders),
            'leaderboards' => $leaderboards,
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function fetchLatestOrders($col): array
    {
        $cursor = $col->find(
            [],
            [
                'sort'       => ['createdAt' => -1],
                'limit'      => 12,
                'projection' => [
                    'order_code'      => 1,
                    'personal_detail' => 1,
                    'total_payment'   => 1,
                    'platform'        => 1,
                    'is_paid'         => 1,
                    'createdAt'       => 1,
                    'history_status'  => 1,
                    'resi'            => 1,
                ],
            ]
        );

        return collect(iterator_to_array($cursor))->map(function ($doc) {
            $o              = (array) $doc;
            $personalDetail = is_array($o['personal_detail'] ?? null)
                ? $o['personal_detail']
                : (array) ($o['personal_detail'] ?? []);
            $historyStatus  = $o['history_status'] ?? [];
            $currentStatus  = null;

            if (is_array($historyStatus) && count($historyStatus) > 0) {
                $last      = (array) end((array) $historyStatus);
                $statusObj = is_array($last['status'] ?? null) ? $last['status'] : (array) ($last['status'] ?? []);
                $currentStatus = $statusObj['status_name'] ?? null;
            }

            return [
                'order_code'    => $o['order_code']    ?? '-',
                'customer_name' => $personalDetail['customer_name'] ?? 'Unknown',
                'total_payment' => (int) ($o['total_payment'] ?? 0),
                'platform'      => $o['platform']      ?? null,
                'is_paid'       => $o['is_paid']       ?? false,
                'status'        => $currentStatus,
                'resi'          => $o['resi']          ?? null,
                'created_at'    => $o['createdAt']     ?? null,
            ];
        })->values()->toArray();
    }

    /**
     * Aggregate top PIC (CS, CS Support, Layouter) menggunakan MongoDB aggregation pipeline.
     */
    private function buildPicLeaderboard($collection, UTCDateTime $mStart, UTCDateTime $mEnd): array
    {
        $matchDate = ['$match' => ['createdAt' => ['$gte' => $mStart, '$lte' => $mEnd]]];

        $roles = [
            'cs'         => 'pic.cs',
            'cs_support' => 'pic.cs_support',
            'layouter'   => 'pic.layouter',
        ];

        $raw = [];
        foreach ($roles as $roleKey => $field) {
            $cursor        = $collection->aggregate([
                $matchDate,
                ['$match' => [$field => ['$exists' => true, '$ne' => null]]],
                ['$group' => ['_id' => '$' . $field, 'count' => ['$sum' => 1]]],
                ['$sort'  => ['count' => -1]],
                ['$limit' => 5],
            ]);
            $raw[$roleKey] = iterator_to_array($cursor);
        }

        // Kumpulkan ObjectId unik dari hasil leaderboard
        $uniqueIds = [];
        foreach ($raw as $roleData) {
            foreach ($roleData as $item) {
                $oid = ((array) $item)['_id'] ?? null;
                if ($oid instanceof ObjectId) {
                    $uniqueIds[(string) $oid] = true;
                }
            }
        }

        // Ambil nama karyawan (satu query untuk semua role)
        $employeeMap = [];
        foreach (\DB::connection('mongodb_remote')->table('employees')->get() as $emp) {
            $emp = (array) $emp;
            $oid = $emp['id'] ?? $emp['_id'] ?? null;
            if ($oid instanceof ObjectId) {
                $employeeMap[(string) $oid] = $emp['name'] ?? 'Unknown';
            }
        }

        $leaderboards = [];
        foreach ($raw as $roleKey => $roleData) {
            $leaderboards[$roleKey] = [];
            foreach ($roleData as $rank => $item) {
                $item = (array) $item;
                $oid  = $item['_id'] instanceof ObjectId ? (string) $item['_id'] : null;
                $leaderboards[$roleKey][] = [
                    'rank'  => $rank + 1,
                    'name'  => $oid ? ($employeeMap[$oid] ?? 'Unknown') : 'Tidak Diketahui',
                    'count' => (int) ($item['count'] ?? 0),
                ];
            }
        }

        return $leaderboards;
    }

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

    private function previousPeriod(Carbon $start, Carbon $end): array
    {
        $diff = $start->diffInSeconds($end) + 1;

        return [
            $start->copy()->subSeconds($diff)->startOfDay(),
            $start->copy()->subSecond()->endOfDay(),
        ];
    }
}

