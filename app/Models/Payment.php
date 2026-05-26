<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Payment
 * 
 * @property int $id
 * @property string $method
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Order[] $orders
 *
 * @package App\Models
 */
class Payment extends Model
{
	protected $table = 'payments';

	protected $fillable = [
		'method'
	];

	public function orders()
	{
		return $this->hasMany(Order::class);
	}
}
