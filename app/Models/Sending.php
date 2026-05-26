<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Sending
 * 
 * @property int $id
 * @property string $sender
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Order[] $orders
 *
 * @package App\Models
 */
class Sending extends Model
{
	protected $table = 'sendings';

	protected $fillable = [
		'sender'
	];

	public function orders()
	{
		return $this->hasMany(Order::class);
	}
}
