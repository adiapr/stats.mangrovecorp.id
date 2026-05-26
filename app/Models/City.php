<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class City
 * 
 * @property int $id
 * @property string $name
 * @property string $type
 * @property int $province_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Province $province
 * @property Collection|District[] $districts
 *
 * @package App\Models
 */
class City extends Model
{
	protected $table = 'cities';

	protected $casts = [
		'province_id' => 'int'
	];

	protected $fillable = [
		'name',
		'type',
		'province_id'
	];

	public function province()
	{
		return $this->belongsTo(Province::class);
	}

	public function districts()
	{
		return $this->hasMany(District::class);
	}
}
