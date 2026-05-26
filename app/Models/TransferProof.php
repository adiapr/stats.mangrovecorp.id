<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class TransferProof
 * 
 * @property int $id
 * @property string $url
 * @property string $storage_type
 * @property string $name
 * @property int $order_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $transfer_date
 * 
 * @property Order $order
 *
 * @package App\Models
 */
class TransferProof extends Model
{
	protected $table = 'transfer_proofs';

	protected $casts = [
		'order_id' => 'int',
		'transfer_date' => 'datetime'
	];

	protected $fillable = [
		'url',
		'storage_type',
		'name',
		'order_id',
		'transfer_date'
	];

	public function order()
	{
		return $this->belongsTo(Order::class);
	}
}
