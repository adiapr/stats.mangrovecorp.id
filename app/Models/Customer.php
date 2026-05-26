<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Customer
 * 
 * @property int $id
 * @property int $phone
 * @property int $second_phone
 * @property string $email
 * @property string $surename
 * @property string $first_name
 * @property string|null $last_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Address[] $addresses
 * @property Collection|Order[] $orders
 * @property Collection|ReturnOrder[] $return_orders
 *
 * @package App\Models
 */
class Customer extends Model
{
	protected $table = 'customers';

	protected $casts = [
		'phone' => 'int',
		'second_phone' => 'int'
	];

	protected $fillable = [
		'phone',
		'second_phone',
		'email',
		'surename',
		'first_name',
		'last_name'
	];

	public function addresses()
	{
		return $this->hasMany(Address::class);
	}

	public function orders()
	{
		return $this->hasMany(Order::class);
	}

	public function return_orders()
	{
		return $this->hasMany(ReturnOrder::class);
	}
}
