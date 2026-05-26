<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class History
 * 
 * @property int $id
 * @property string $status
 * @property int $order_id
 * @property int|null $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class History extends Model
{
	protected $table = 'histories';

	protected $casts = [
		'order_id' => 'int',
		'user_id' => 'int'
	];

	protected $fillable = [
		'status',
		'order_id',
		'user_id'
	];
}
