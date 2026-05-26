<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class District
 * 
 * @property int $id
 * @property string $name
 * @property int $city_id
 * @property string $jnt_province_codename
 * @property string $jnt_city_code
 * @property string $jnt_city_codename
 * @property string $jnt_code
 * @property string $jnt_codename
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property City $city
 *
 * @package App\Models
 */
class District extends Model
{
	protected $table = 'districts';

	protected $casts = [
		'city_id' => 'int'
	];

	protected $fillable = [
		'name',
		'city_id',
		'jnt_province_codename',
		'jnt_city_code',
		'jnt_city_codename',
		'jnt_code',
		'jnt_codename'
	];

	public function city()
	{
		return $this->belongsTo(City::class);
	}
}
