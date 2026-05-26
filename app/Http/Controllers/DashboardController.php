<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use MongoDB\BSON\UTCDateTime;

class DashboardController extends Controller
{
    public function index()
    {
        $data = Cache::remember('dashboard:summary', 10, fn () => $this->fetchAll());

        return Inertia::render('dashboard', $data);
    }

    // ── Core ──────────────────────────────────────────────────────────────

    private function fetchAll(): array
    {
        $now        = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd   = $now->copy()->endOfMonth();
        $todayStart = Carbon::today();
        $todayEnd   = Carbon::today()->endOfDay();
        $prevStart  = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $prevEnd    = $now->copy()->subMonthNoOverflow()->endOfMonth();
        $last30     = $now->copy()->subDays(29)->startOfDay();

        $col    = \DB::connection('mongodb_remote')->getDatabase()->selectCollection('orders');
        $mStart = new UTCDateTime((int) ($monthStart->getTimestamp() * 1000));
        $mEnd   = new UTCDateTime((int) ($monthEnd->getTimestamp() * 1000));
        $tStart = new UTCDateTime((int) ($todayStart->getTimestamp() * 1000));
        $tEnd   = new UTCDateTime((int) ($todayEnd->getTimestamp() * 1000));
        $pStart = new UTCDateTime((int) ($prevStart->getTimestamp() * 1000));
        $pEnd   = new UTCDateTime((int) ($prevEnd->getTimestamp() * 1000));
        $l30S   = new UTCDateTime((int) ($last30->getTimestamp() * 1000));
        $l30E   = new UTCDateTime((int) ($now->copy()->endOfDay()->getTimestamp() * 1000));

        return [
            'mkl'              => $this->mklSummary($monthStart, $monthEnd, $todayStart, $todayEnd, $prevStart, $prevEnd),
            'idp'              => $this->idpSummary($col, $mStart, $mEnd, $tStart, $tEnd, $pStart, $pEnd),
            'comparisonDaily'  => $this->comparisonDaily($col, $last30, $now->copy()->endOfDay(), $l30S, $l30E),
            'comparisonHourly' => $this->comparisonHourly($col, $todayStart, $todayEnd, $tStart, $tEnd),
        ];
    }

    // ── Makenliving (MySQL) ────────────────────────────────────────────────

    private function mklSummary(
        Carbon $start, Carbon $end,
        Carbon $tStart, Carbon $tEnd,
        Carbon $pStart, Carbon $pEnd
    ): array {
        $totalOrders  = Order::whereBetween('created_at', [$start, $end])->count();
        $totalRevenue = (int) Order::whereBetween('created_at', [$start, $end])->sum('total_price');
        $todayOrders  = Order::whereBetween('created_at', [$tStart, $tEnd])->count();
        $prevOrders   = Order::whereBetween('created_at', [$pStart, $pEnd])->count();
        $prevRevenue  = (int) Order::whereBetween('created_at', [$pStart, $pEnd])->sum('total_price');

        return [
            'total_orders'   => $totalOrders,
            'total_revenue'  => $totalRevenue,
            'today_orders'   => $todayOrders,
            'order_growth'   => $prevOrders  > 0 ? round(($totalOrders  - $prevOrders)  / $prevOrders  * 100, 1) : 0,
            'revenue_growth' => $prevRevenue > 0 ? round(($totalRevenue - $prevRevenue) / $prevRevenue * 100, 1) : 0,
        ];
    }

    // ── IDPhotobook (MongoDB) ─────────────────────────────────────────────

    private function idpSummary(
        $col,
        UTCDateTime $mStart, UTCDateTime $mEnd,
        UTCDateTime $tStart, UTCDateTime $tEnd,
        UTCDateTime $pStart, UTCDateTime $pEnd
    ): array {
        // Bulan ini + hari ini dalam satu $facet
        $facetResult = iterator_to_array($col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $mStart, '$lte' => $mEnd]]],
            ['$facet' => [
                'month' => [
                    ['$group' => ['_id' => null, 'orders' => ['$sum' => 1], 'revenue' => ['$sum' => '$total_payment']]],
                ],
                'today' => [
                    ['$match' => ['createdAt' => ['$gte' => $tStart, '$lte' => $tEnd]]],
                    ['$group' => ['_id' => null, 'count' => ['$sum' => 1]]],
                ],
            ]],
        ]));

        $facet      = (array) ($facetResult[0] ?? []);
        $monthItems = $facet['month'] ? iterator_to_array($facet['month']) : [];
        $month      = (array) ($monthItems[0] ?? []);
        $todayItems = $facet['today'] ? iterator_to_array($facet['today']) : [];
        $todayData  = (array) ($todayItems[0] ?? []);

        // Periode sebelumnya
        $prevResult = iterator_to_array($col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $pStart, '$lte' => $pEnd]]],
            ['$group' => ['_id' => null, 'orders' => ['$sum' => 1], 'revenue' => ['$sum' => '$total_payment']]],
        ]));
        $prev = (array) ($prevResult[0] ?? []);

        $totalOrders  = (int) ($month['orders']  ?? 0);
        $totalRevenue = (int) ($month['revenue'] ?? 0);
        $prevOrders   = (int) ($prev['orders']   ?? 0);
        $prevRevenue  = (int) ($prev['revenue']  ?? 0);

        return [
            'total_orders'   => $totalOrders,
            'total_revenue'  => $totalRevenue,
            'today_orders'   => (int) ($todayData['count'] ?? 0),
            'order_growth'   => $prevOrders  > 0 ? round(($totalOrders  - $prevOrders)  / $prevOrders  * 100, 1) : 0,
            'revenue_growth' => $prevRevenue > 0 ? round(($totalRevenue - $prevRevenue) / $prevRevenue * 100, 1) : 0,
        ];
    }

    // ── Daily Comparison (last 30 days) ───────────────────────────────────

    private function comparisonDaily($col, Carbon $start, Carbon $end, UTCDateTime $l30S, UTCDateTime $l30E): array
    {
        // Makenliving
        $mklRows = Order::whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // IDPhotobook
        $idpResult = iterator_to_array($col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $l30S, '$lte' => $l30E]]],
            ['$group' => [
                '_id'     => ['$dateToString' => ['format' => '%Y-%m-%d', 'date' => '$createdAt']],
                'orders'  => ['$sum' => 1],
                'revenue' => ['$sum' => '$total_payment'],
            ]],
            ['$sort' => ['_id' => 1]],
        ]));
        $idpMap = collect($idpResult)
            ->keyBy(fn ($r) => (string) ((array) $r)['_id'])
            ->map(fn ($r) => [
                'orders'  => (int) ((array) $r)['orders'],
                'revenue' => (int) ((array) $r)['revenue'],
            ]);

        // Merge by date range
        $result = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $date     = $cursor->toDateString();
            $result[] = [
                'label'       => substr($date, 5),
                'mkl_orders'  => (int) ($mklRows[$date]->orders  ?? 0),
                'mkl_revenue' => (int) ($mklRows[$date]->revenue ?? 0),
                'idp_orders'  => $idpMap[$date]['orders']  ?? 0,
                'idp_revenue' => $idpMap[$date]['revenue'] ?? 0,
            ];
            $cursor->addDay();
        }

        return $result;
    }

    // ── Hourly Comparison (today) ─────────────────────────────────────────

    private function comparisonHourly($col, Carbon $todayStart, Carbon $todayEnd, UTCDateTime $tStart, UTCDateTime $tEnd): array
    {
        // Makenliving
        $mklRows = Order::whereBetween('created_at', [$todayStart, $todayEnd])
            ->select(
                DB::raw('HOUR(created_at) as hour_num'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('hour_num')
            ->get()
            ->keyBy('hour_num');

        // IDPhotobook
        $idpResult = iterator_to_array($col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $tStart, '$lte' => $tEnd]]],
            ['$group' => [
                '_id'     => ['$hour' => '$createdAt'],
                'orders'  => ['$sum' => 1],
                'revenue' => ['$sum' => '$total_payment'],
            ]],
            ['$sort' => ['_id' => 1]],
        ]));
        $idpMap = collect($idpResult)
            ->keyBy(fn ($r) => (int) ((array) $r)['_id'])
            ->map(fn ($r) => [
                'orders'  => (int) ((array) $r)['orders'],
                'revenue' => (int) ((array) $r)['revenue'],
            ]);

        $result = [];
        for ($h = 0; $h < 24; $h++) {
            $result[] = [
                'label'       => str_pad($h, 2, '0', STR_PAD_LEFT) . ':00',
                'mkl_orders'  => (int) ($mklRows[$h]->orders  ?? 0),
                'mkl_revenue' => (int) ($mklRows[$h]->revenue ?? 0),
                'idp_orders'  => $idpMap[$h]['orders']  ?? 0,
                'idp_revenue' => $idpMap[$h]['revenue'] ?? 0,
            ];
        }

        return $result;
    }
}
