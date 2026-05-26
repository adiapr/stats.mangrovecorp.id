<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Coupon
 * 
 * @property int $id
 * @property string $name
 * @property string $code
 * @property int $discount
 * @property string $category
 * @property string $type
 * @property Carbon $date_start
 * @property Carbon $date_end
 * @property int $coupon_uses
 * @property int $customer_uses
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Order[] $orders
 *
 * @package App\Models
 */
class Coupon extends Model
{
	protected $table = 'coupons';

	protected $casts = [
		'discount' => 'int',
		'date_start' => 'datetime',
		'date_end' => 'datetime',
		'coupon_uses' => 'int',
		'customer_uses' => 'int'
	];

	protected $fillable = [
		'name',
		'code',
		'discount',
		'category',
		'type',
		'date_start',
		'date_end',
		'coupon_uses',
		'customer_uses',
		'status'
	];

	public function orders()
	{
		return $this->hasMany(Order::class);
	}
}
