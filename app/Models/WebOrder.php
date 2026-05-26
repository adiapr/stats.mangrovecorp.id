<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebOrder extends Model
{
    protected $table = 'web_orders';

    protected $fillable = [
        'product_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'quantity',
        'price',
        'total_price',
        'notes',
        'status',
    ];

    protected $casts = [
        'product_id' => 'int',
        'quantity' => 'int',
        'price' => 'int',
        'total_price' => 'int',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
