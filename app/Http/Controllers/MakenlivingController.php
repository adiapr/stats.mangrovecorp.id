<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MakenlivingController extends Controller
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

        // ── KPI ──────────────────────────────────────────────────────────────
        $totalOrders   = Order::whereBetween('created_at', [$start, $end])->count();
        $totalRevenue  = (int) Order::whereBetween('created_at', [$start, $end])->sum('total_price');
        $prevOrders    = Order::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $prevRevenue   = (int) Order::whereBetween('created_at', [$prevStart, $prevEnd])->sum('total_price');
        $orderGrowth   = $prevOrders > 0 ? round(($totalOrders - $prevOrders) / $prevOrders * 100, 1) : 0;
        $revenueGrowth = $prevRevenue > 0 ? round(($totalRevenue - $prevRevenue) / $prevRevenue * 100, 1) : 0;
        $avgOrderValue = $totalOrders > 0 ? (int) ($totalRevenue / $totalOrders) : 0;

        $kpi = [
            'total_orders'    => $totalOrders,
            'total_revenue'   => $totalRevenue,
            'avg_order_value' => $avgOrderValue,
            'order_growth'    => $orderGrowth,
            'revenue_growth'  => $revenueGrowth,
        ];

        // ── Status Distribution ───────────────────────────────────────────────
        $statusData = Order::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => ['status' => (string) ($row->status ?? 'unknown'), 'count' => (int) $row->count])
            ->values()
            ->toArray();

        // ── Trend ────────────────────────────────────────────────────────────
        $orders = Order::whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'asc')
            ->select(['id', 'created_at', 'total_price'])
            ->get();

        if ($singleDay) {
            $buckets = array_fill(0, 24, ['orders' => 0, 'revenue' => 0]);
            foreach ($orders as $o) {
                $hour = (int) Carbon::parse($o->created_at)->format('H');
                $buckets[$hour]['orders']++;
                $buckets[$hour]['revenue'] += (int) ($o->total_price ?? 0);
            }
            $trend = array_map(
                fn($hour, $data) => [
                    'label'   => str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00',
                    'orders'  => $data['orders'],
                    'revenue' => $data['revenue'],
                ],
                array_keys($buckets),
                array_values($buckets),
            );
        } else {
            $trend = $orders
                ->groupBy(fn($o) => Carbon::parse($o->created_at)->format('Y-m-d'))
                ->map(fn($group, $date) => [
                    'label'   => substr($date, 5),
                    'orders'  => $group->count(),
                    'revenue' => (int) $group->sum('total_price'),
                ])
                ->sortKeys()
                ->values()
                ->toArray();
        }

        // ── CS Leaderboard (semua user diranking by order count) ─────────────
        $csRows = Order::whereBetween('created_at', [$start, $end])
            ->select('user_id', DB::raw('count(*) as order_count'), DB::raw('sum(total_price) as total_revenue'))
            ->groupBy('user_id')
            ->orderByDesc('order_count')
            ->with('user:id,username')
            ->get();

        $csLeaderboard = $csRows->values()->map(fn($row, $i) => [
            'rank'    => $i + 1,
            'name'    => $row->user?->username ?? 'Unknown',
            'count'   => (int) $row->order_count,
            'revenue' => (int) $row->total_revenue,
            'share'   => $totalOrders > 0 ? round($row->order_count / $totalOrders * 100, 1) : 0,
        ])->values()->toArray();

        // ── Latest Orders ─────────────────────────────────────────────────────
        $latestOrders = Order::whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->with(['user:id,username', 'customer:id,first_name,last_name'])
            ->limit(12)
            ->get()
            ->map(fn($o) => [
                'order_code'    => $o->order_code ?? '-',
                'customer_name' => trim(($o->customer?->first_name ?? '') . ' ' . ($o->customer?->last_name ?? '')) ?: '-',
                'user_name'     => $o->user?->username ?? '-',
                'total_price'   => (int) ($o->total_price ?? 0),
                'status'        => $o->status ?? '-',
                'created_at'    => $o->created_at?->toDateTimeString(),
            ])
            ->toArray();

        return Inertia::render('makenliving', [
            'period'       => $period,
            'periodStart'  => $start->toDateString(),
            'periodEnd'    => $end->toDateString(),
            'trendType'    => $singleDay ? 'hourly' : 'daily',
            'kpi'          => $kpi,
            'statusData'   => $statusData,
            'trend'          => $trend,
            'csLeaderboard'  => $csLeaderboard,
            'latestOrders'   => array_values($latestOrders),
        ]);
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
