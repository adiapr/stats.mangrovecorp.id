<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Counter
 * 
 * @property int $id
 * @property string $parameter
 * @property int $counter
 * @property string $description
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @package App\Models
 */
class Counter extends Model
{
	protected $table = 'counters';

	protected $casts = [
		'counter' => 'int'
	];

	protected $fillable = [
		'parameter',
		'counter',
		'description'
	];
}
