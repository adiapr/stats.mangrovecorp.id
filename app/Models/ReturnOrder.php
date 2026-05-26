<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ReturnOrder
 * 
 * @property int $id
 * @property string $return_id
 * @property int $order_id
 * @property string $order_code
 * @property Carbon $order_date
 * @property int $customer_id
 * @property int $product_id
 * @property int $quantity
 * @property string $return_reason
 * @property string $opened
 * @property string|null $comment
 * @property string $return_action
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Customer $customer
 * @property Order $order
 * @property Product $product
 *
 * @package App\Models
 */
class ReturnOrder extends Model
{
	protected $table = 'return_orders';

	protected $casts = [
		'order_id' => 'int',
		'order_date' => 'datetime',
		'customer_id' => 'int',
		'product_id' => 'int',
		'quantity' => 'int'
	];

	protected $fillable = [
		'return_id',
		'order_id',
		'order_code',
		'order_date',
		'customer_id',
		'product_id',
		'quantity',
		'return_reason',
		'opened',
		'comment',
		'return_action',
		'status'
	];

	public function customer()
	{
		return $this->belongsTo(Customer::class);
	}

	public function order()
	{
		return $this->belongsTo(Order::class);
	}

	public function product()
	{
		return $this->belongsTo(Product::class);
	}
}
