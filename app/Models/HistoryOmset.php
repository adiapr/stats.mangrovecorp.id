<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class HistoryOmset
 * 
 * @property int $id
 * @property int $order_id
 * @property float $omset
 * @property int $user_id
 * @property int $customer_id
 * @property Carbon $transaction_date
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property int $created_by
 *
 * @package App\Models
 */
class HistoryOmset extends Model
{
	protected $table = 'history_omset';

	protected $casts = [
		'order_id' => 'int',
		'omset' => 'float',
		'user_id' => 'int',
		'customer_id' => 'int',
		'transaction_date' => 'datetime',
		'created_by' => 'int'
	];

	protected $fillable = [
		'order_id',
		'omset',
		'user_id',
		'customer_id',
		'transaction_date',
		'created_by'
	];
}
