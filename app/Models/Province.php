<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Province
 * 
 * @property int $id
 * @property string $name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|City[] $cities
 *
 * @package App\Models
 */
class Province extends Model
{
	protected $table = 'provinces';

	protected $fillable = [
		'name'
	];

	public function cities()
	{
		return $this->hasMany(City::class);
	}
}
