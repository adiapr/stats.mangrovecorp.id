<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Checkout
 * 
 * @property int $id
 * @property int|null $order_id
 * @property string $order_code
 * @property int $product_id
 * @property int $quantity
 * @property int $price
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Product $product
 *
 * @package App\Models
 */
class Checkout extends Model
{
	protected $table = 'checkouts';

	protected $casts = [
		'order_id' => 'int',
		'product_id' => 'int',
		'quantity' => 'int',
		'price' => 'int'
	];

	protected $fillable = [
		'order_id',
		'order_code',
		'product_id',
		'quantity',
		'price'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}
}
