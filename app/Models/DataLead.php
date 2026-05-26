<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class DataLead
 * 
 * @property int $id
 * @property string $sumber_lead
 * @property int $jumlah_lead
 * @property int $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $price
 *
 * @package App\Models
 */
class DataLead extends Model
{
	protected $table = 'data_leads';

	protected $casts = [
		'jumlah_lead' => 'int',
		'user_id' => 'int'
	];

	protected $fillable = [
		'sumber_lead',
		'jumlah_lead',
		'user_id',
		'price'
	];
}
