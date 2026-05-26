<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'this_month');
        $customStart = $request->input('start');
        $customEnd = $request->input('end');

        [$start, $end] = $this->resolvePeriod($period, $customStart, $customEnd);
        [$prevStart, $prevEnd] = $this->previousPeriod($start, $end);

        $db = \DB::connection('mongodb_remote');

        // ── KPI Periode Ini ────────────────────────────────────────────────
        $totalOrders = $db->table('orders')
            ->whereBetween('createdAt', [$start, $end])
            ->count();

        $paidOrders = $db->table('orders')
            ->whereBetween('createdAt', [$start, $end])
            ->where('is_paid', true)
            ->count();

        $totalRevenue = $db->table('orders')
            ->whereBetween('createdAt', [$start, $end])
            ->sum('total_payment');

        // ── KPI Periode Sebelumnya (untuk hitung growth) ──────────────────
        $prevTotalOrders = $db->table('orders')
            ->whereBetween('createdAt', [$prevStart, $prevEnd])
            ->count();

        $prevRevenue = $db->table('orders')
            ->whereBetween('createdAt', [$prevStart, $prevEnd])
            ->sum('total_payment');

        // ── Distribusi Platform ───────────────────────────────────────────
        $platformRaw = $db->table('orders')
            ->whereBetween('createdAt', [$start, $end])
            ->select('platform')
            ->get();

        $platformGroups = collect($platformRaw)
            ->groupBy(fn($o) => $o->platform ?: 'Lainnya')
            ->map(fn($group, $name) => ['platform' => $name, 'count' => $group->count()])
            ->sortByDesc('count')
            ->values()
            ->toArray();

        // ── Trend Harian / Per Jam ─────────────────────────────────────────
        $singleDay = in_array($period, ['today', 'yesterday'])
            || ($period === 'custom' && $start->toDateString() === $end->toDateString());

        $recentOrders = $db->table('orders')
            ->whereBetween('createdAt', [$start, $end])
            ->orderBy('createdAt', 'asc')
            ->select(['order_code', 'createdAt', 'total_payment', 'platform', 'is_paid'])
            ->get();

        if ($singleDay) {
            // Isi 24 jam kosong dulu, lalu hitung per jam
            $buckets = array_fill(0, 24, ['orders' => 0, 'revenue' => 0]);
            foreach ($recentOrders as $o) {
                $hour = (int) Carbon::parse($o->createdAt)->format('H');
                $buckets[$hour]['orders']++;
                $buckets[$hour]['revenue'] += (int) ($o->total_payment ?? 0);
            }
            $dailyTrend = array_map(
                fn($hour, $data) => [
                    'label'   => str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00',
                    'orders'  => $data['orders'],
                    'revenue' => $data['revenue'],
                ],
                array_keys($buckets),
                array_values($buckets),
            );
        } else {
            $dailyTrend = collect($recentOrders)
                ->groupBy(fn($o) => Carbon::parse($o->createdAt)->format('Y-m-d'))
                ->map(fn($group, $date) => [
                    'label'   => substr($date, 5), // "MM-DD"
                    'orders'  => $group->count(),
                    'revenue' => $group->sum(fn($o) => $o->total_payment ?? 0),
                ])
                ->sortKeys()
                ->values()
                ->toArray();
        }

        // ── Transaksi Terbaru ─────────────────────────────────────────────
        $latestOrders = $db->table('orders')
            ->orderBy('createdAt', 'desc')
            ->limit(12)
            ->select(['order_code', 'personal_detail', 'total_payment', 'platform', 'is_paid', 'createdAt', 'history_status', 'resi'])
            ->get()
            ->map(function ($o) {
                $o = (array) $o;
                $personalDetail = is_array($o['personal_detail'] ?? null)
                    ? $o['personal_detail']
                    : (array)($o['personal_detail'] ?? []);

                $historyStatus = $o['history_status'] ?? [];
                $currentStatus = null;
                if (is_array($historyStatus) && count($historyStatus) > 0) {
                    $last = end($historyStatus);
                    $last = (array) $last;
                    $statusObj = is_array($last['status'] ?? null) ? $last['status'] : (array)($last['status'] ?? []);
                    $currentStatus = $statusObj['status_name'] ?? null;
                }

                return [
                    'order_code'    => $o['order_code'] ?? '-',
                    'customer_name' => $personalDetail['customer_name'] ?? 'Unknown',
                    'total_payment' => $o['total_payment'] ?? 0,
                    'platform'      => $o['platform'] ?? null,
                    'is_paid'       => $o['is_paid'] ?? false,
                    'status'        => $currentStatus,
                    'resi'          => $o['resi'] ?? null,
                    'created_at'    => $o['createdAt'] ?? null,
                ];
            })
            ->toArray();

        // ── Hitung Growth ─────────────────────────────────────────────────
        $orderGrowth  = $prevTotalOrders > 0
            ? round((($totalOrders - $prevTotalOrders) / $prevTotalOrders) * 100, 1)
            : 0;

        $revenueGrowth = $prevRevenue > 0
            ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1)
            : 0;

        $avgOrderValue = $totalOrders > 0 ? (int) round($totalRevenue / $totalOrders) : 0;
        $paidRate      = $totalOrders > 0 ? round(($paidOrders / $totalOrders) * 100, 1) : 0;

        // ── Leaderboard PIC ───────────────────────────────────────────────
        $leaderboards = $this->buildPicLeaderboard($start, $end);

        return Inertia::render('analytics', [
            'period'       => $period,
            'periodStart'  => $start->toDateString(),
            'periodEnd'    => $end->toDateString(),
            'kpi'          => [
                'total_orders'   => $totalOrders,
                'total_revenue'  => (int) $totalRevenue,
                'paid_orders'    => $paidOrders,
                'paid_rate'      => $paidRate,
                'avg_order_value'=> $avgOrderValue,
                'order_growth'   => $orderGrowth,
                'revenue_growth' => $revenueGrowth,
            ],
            'trendType'    => $singleDay ? 'hourly' : 'daily',
            'platformData' => array_values($platformGroups),
            'dailyTrend'   => $dailyTrend,
            'latestOrders' => array_values($latestOrders),
            'leaderboards' => $leaderboards,
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /**
     * Aggregate top PIC (CS, CS Support, Layouter) by order count in the period.
     * Uses raw MongoDB aggregation pipeline for performance on large collections.
     */
    private function buildPicLeaderboard(Carbon $start, Carbon $end): array
    {
        $mongoDb    = \DB::connection('mongodb_remote')->getDatabase();
        $collection = $mongoDb->selectCollection('orders');

        $mongoStart = new UTCDateTime((int) ($start->getTimestamp() * 1000));
        $mongoEnd   = new UTCDateTime((int) ($end->getTimestamp() * 1000));

        $matchDate = [
            '$match' => [
                'createdAt' => ['$gte' => $mongoStart, '$lte' => $mongoEnd],
            ],
        ];

        // Aggregate for each role
        $roles = [
            'cs'         => 'pic.cs',
            'cs_support' => 'pic.cs_support',
            'layouter'   => 'pic.layouter',
        ];

        $raw = [];
        foreach ($roles as $roleKey => $field) {
            $cursor = $collection->aggregate([
                $matchDate,
                ['$match' => [$field => ['$exists' => true, '$ne' => null]]],
                ['$group' => ['_id' => '$' . $field, 'count' => ['$sum' => 1]]],
                ['$sort'  => ['count' => -1]],
                ['$limit' => 5],
            ]);
            $raw[$roleKey] = iterator_to_array($cursor);
        }

        // Collect all unique employee ObjectIds across all roles
        $uniqueIds = [];
        foreach ($raw as $roleData) {
            foreach ($roleData as $item) {
                $oid = $item['_id'] ?? null;
                if ($oid instanceof ObjectId) {
                    $uniqueIds[(string) $oid] = true;
                }
            }
        }

        // Fetch all 86 employees in one query and build an id→name map
        $employeeMap = [];
        $empRows = \DB::connection('mongodb_remote')->table('employees')->get();
        foreach ($empRows as $emp) {
            $emp = (array) $emp;
            // Laravel MongoDB query builder renames '_id' → 'id' on results
            $oid = $emp['id'] ?? $emp['_id'] ?? null;
            if ($oid instanceof ObjectId) {
                $employeeMap[(string) $oid] = $emp['name'] ?? 'Unknown';
            }
        }

        // Build structured leaderboard arrays
        $leaderboards = [];
        foreach ($raw as $roleKey => $roleData) {
            $leaderboards[$roleKey] = [];
            foreach ($roleData as $rank => $item) {
                $oid  = $item['_id'] instanceof ObjectId ? (string) $item['_id'] : null;
                $name = $oid ? ($employeeMap[$oid] ?? 'Unknown') : 'Tidak Diketahui';
                $leaderboards[$roleKey][] = [
                    'rank'  => $rank + 1,
                    'name'  => $name,
                    'count' => (int) $item['count'],
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
