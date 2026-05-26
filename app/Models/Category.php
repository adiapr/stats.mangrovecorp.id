<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Category
 * 
 * @property int $id
 * @property string $name
 * @property string $tag
 * @property string|null $description
 * @property string $category_status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|ProductCategory[] $product_categories
 *
 * @package App\Models
 */
class Category extends Model
{
	protected $table = 'categories';

	protected $fillable = [
		'name',
		'tag',
		'description',
		'category_status'
	];

	public function product_categories()
	{
		return $this->hasMany(ProductCategory::class);
	}
}
