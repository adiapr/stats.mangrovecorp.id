<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Class User
 * 
 * @property int $id
 * @property string $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string $first_name
 * @property string $last_name
 * @property string|null $image
 * @property int $code
 * @property int $role_id
 * @property string $status
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Role $role
 * @property Collection|Order[] $orders
 *
 * @package App\Models
 */
class User extends Authenticatable
{
	protected $table = 'users';

	protected $casts = [
		'email_verified_at' => 'datetime',
		'two_factor_confirmed_at' => 'datetime',
		'code' => 'int',
		'role_id' => 'int'
	];

	protected $hidden = [
		'password',
		'two_factor_secret',
		'remember_token'
	];

	protected $fillable = [
		'username',
		'email',
		'email_verified_at',
		'password',
		'two_factor_secret',
		'two_factor_recovery_codes',
		'two_factor_confirmed_at',
		'first_name',
		'last_name',
		'image',
		'code',
		'role_id',
		'status',
		'remember_token'
	];

	public function role()
	{
		return $this->belongsTo(Role::class);
	}

	public function orders()
	{
		return $this->hasMany(Order::class);
	}
}
