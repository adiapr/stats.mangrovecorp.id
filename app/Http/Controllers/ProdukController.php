<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use MongoDB\BSON\UTCDateTime;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $period      = $request->input('period', 'this_month');
        $customStart = $request->input('start');
        $customEnd   = $request->input('end');

        [$start, $end] = $this->resolvePeriod($period, $customStart, $customEnd);

        $cacheKey = "produk:{$period}:{$start->toDateString()}:{$end->toDateString()}";
        $data = Cache::remember($cacheKey, 5, fn () => $this->fetchAll($start, $end));

        return Inertia::render('produk', [
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
            'mkl' => $this->mklProduk($start, $end),
            'idp' => $this->idpProduk($start, $end),
        ];
    }

    // ── Makenliving (MySQL) ───────────────────────────────────────────────

    private function mklProduk(Carbon $start, Carbon $end): array
    {
        // Product ranking via checkouts table
        $productRows = DB::table('checkouts')
            ->join('orders', 'checkouts.order_id', '=', 'orders.id')
            ->join('products', 'checkouts.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('checkouts.price', '>', 0)
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(checkouts.quantity) as qty'),
                DB::raw('COUNT(DISTINCT checkouts.order_id) as orders'),
                DB::raw('SUM(checkouts.quantity * checkouts.price) as revenue'),
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('qty')
            ->get();

        $totalQty     = (int) $productRows->sum('qty');
        $totalRevenue = (int) $productRows->sum('revenue');
        $totalOrders  = DB::table('checkouts')
            ->join('orders', 'checkouts.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('checkouts.price', '>', 0)
            ->distinct('checkouts.order_id')
            ->count('checkouts.order_id');

        $products = $productRows->map(fn ($r) => [
            'product_name' => (string) ($r->product_name ?? 'Tidak Diketahui'),
            'qty'          => (int) $r->qty,
            'orders'       => (int) $r->orders,
            'revenue'      => (int) $r->revenue,
            'share'        => $totalQty > 0 ? round($r->qty / $totalQty * 100, 1) : 0,
        ])->values()->toArray();

        // Category breakdown
        $catRows = DB::table('checkouts')
            ->join('orders', 'checkouts.order_id', '=', 'orders.id')
            ->join('product_categories', 'checkouts.product_id', '=', 'product_categories.product_id')
            ->join('categories', 'product_categories.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('checkouts.price', '>', 0)
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(checkouts.quantity) as qty'),
                DB::raw('COUNT(DISTINCT checkouts.order_id) as orders'),
                DB::raw('SUM(checkouts.quantity * checkouts.price) as revenue'),
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('qty')
            ->get();

        $totalCatQty = (int) $catRows->sum('qty');
        $categories = $catRows->map(fn ($r) => [
            'category' => (string) ($r->category_name ?? 'Lainnya'),
            'qty'      => (int) $r->qty,
            'orders'   => (int) $r->orders,
            'revenue'  => (int) $r->revenue,
            'share'    => $totalCatQty > 0 ? round($r->qty / $totalCatQty * 100, 1) : 0,
        ])->values()->toArray();

        return [
            'products'     => $products,
            'categories'   => $categories,
            'totalQty'     => $totalQty,
            'totalRevenue' => $totalRevenue,
            'totalOrders'  => $totalOrders,
        ];
    }

    // ── IDPhotobook (MongoDB) ─────────────────────────────────────────────

    private function idpProduk(Carbon $start, Carbon $end): array
    {
        $col    = DB::connection('mongodb_remote')->getDatabase()->selectCollection('orders');
        $mStart = new UTCDateTime((int) ($start->getTimestamp() * 1000));
        $mEnd   = new UTCDateTime((int) ($end->getTimestamp() * 1000));

        // Unwind order_item and resolve product names from embedded data or products collection
        $cursor = $col->aggregate([
            ['$match' => ['createdAt' => ['$gte' => $mStart, '$lte' => $mEnd]]],
            ['$unwind' => '$order_item'],
            ['$unwind' => '$order_item.product'],
            ['$lookup' => [
                'from' => 'products',
                'localField' => 'order_item.product.product',
                'foreignField' => '_id',
                'as' => 'product_ref',
            ]],
            ['$addFields' => [
                'resolved_product_name' => [
                    '$ifNull' => [
                        '$order_item.product.product_name',
                        ['$arrayElemAt' => ['$product_ref.product_name', 0]],
                    ],
                ],
            ]],
            ['$match' => ['resolved_product_name' => ['$exists' => true, '$nin' => [null, '']]]],
            ['$group' => [
                '_id'      => '$resolved_product_name',
                'qty'      => ['$sum' => 1],
                'orderIds' => ['$addToSet' => '$_id'],
            ]],
            ['$project' => [
                '_id'    => 1,
                'qty'    => 1,
                'orders' => ['$size' => '$orderIds'],
            ]],
            ['$sort' => ['qty' => -1]],
        ]);

        $rows = collect(iterator_to_array($cursor));

        $totalQtyCalc = 0;
        $productData  = [];
        foreach ($rows as $item) {
            $row = (array) $item;
            $qty = (int) ($row['qty'] ?? 0);
            $totalQtyCalc += $qty;
            $productData[] = [
                'product_name' => (string) ($row['_id'] ?? 'Tidak Diketahui'),
                'qty'          => $qty,
                'orders'       => (int) ($row['orders'] ?? 0),
                'revenue'      => 0, // IDP: no per-product price available
            ];
        }

        $products = array_map(fn ($p) => [
            ...$p,
            'share' => $totalQtyCalc > 0 ? round($p['qty'] / $totalQtyCalc * 100, 1) : 0,
        ], $productData);

        // Total order count
        $totalOrders = (int) $col->countDocuments([
            'createdAt' => ['$gte' => $mStart, '$lte' => $mEnd],
        ]);

        return [
            'products'     => $products,
            'categories'   => [], // IDP: no category data
            'totalQty'     => $totalQtyCalc,
            'totalRevenue' => 0,
            'totalOrders'  => $totalOrders,
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
