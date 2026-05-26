<?php

namespace App\Http\Controllers;

use App\Models\RemoteMongoOrder;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function index()
    {
        $db = \DB::connection('mongodb_remote');

        // Cek collections yang ada di database
        $collections = iterator_to_array($db->getMongoDB()->listCollectionNames());

        // Raw query bypass Eloquent
        $rawOrders = $db->table('orders')->limit(5)->where('createdAt', '>=', now()->subDays(30))->get();
        $rawCount  = $db->table('orders')->where('createdAt', '>=', now()->subDays(30))->count();

        // Via Eloquent model
        $count  = RemoteMongoOrder::count();
        $orders = RemoteMongoOrder::limit(5)->where('createdAt', '>=', now()->subDays(30))->get();

        return response()->json([
            // 'collections_available' => $collections,
            'raw_count'             => $rawCount,
            'raw_orders'            => $rawOrders,
            // 'eloquent_count'        => $count,
            // 'eloquent_orders'       => $orders,
        ]);
    }
}
