<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Address
 * 
 * @property int $id
 * @property int $customer_id
 * @property string $full_address
 * @property string $province
 * @property string $city
 * @property string $district
 * @property int $province_id
 * @property int $city_id
 * @property int $district_id
 * @property int|null $postal_code
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Customer $customer
 * @property Collection|Order[] $orders
 *
 * @package App\Models
 */
class Address extends Model
{
	protected $table = 'addresses';

	protected $casts = [
		'customer_id' => 'int',
		'province_id' => 'int',
		'city_id' => 'int',
		'district_id' => 'int',
		'postal_code' => 'int'
	];

	protected $fillable = [
		'customer_id',
		'full_address',
		'province',
		'city',
		'district',
		'province_id',
		'city_id',
		'district_id',
		'postal_code'
	];

	public function customer()
	{
		return $this->belongsTo(Customer::class);
	}

	public function orders()
	{
		return $this->hasMany(Order::class);
	}
}
