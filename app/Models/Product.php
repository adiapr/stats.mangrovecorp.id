<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Product
 * 
 * @property int $id
 * @property string $name
 * @property string $tag
 * @property string|null $description
 * @property string $model
 * @property int $price
 * @property int $quantity
 * @property int|null $minimum_quantity
 * @property string|null $image
 * @property string|null $photo_url
 * @property string $product_status
 * @property int|null $length
 * @property int|null $width
 * @property int|null $height
 * @property string $length_class
 * @property int|null $weight
 * @property string $weight_class
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Checkout[] $checkouts
 * @property Collection|ProductCategory[] $product_categories
 * @property Collection|ReturnOrder[] $return_orders
 *
 * @package App\Models
 */
class Product extends Model
{
	protected $table = 'products';

	protected $casts = [
		'price' => 'int',
		'quantity' => 'int',
		'minimum_quantity' => 'int',
		'length' => 'int',
		'width' => 'int',
		'height' => 'int',
		'weight' => 'int'
	];

	protected $fillable = [
		'name',
		'tag',
		'description',
		'model',
		'price',
		'quantity',
		'minimum_quantity',
		'image',
				'product_status',
		'length',
		'width',
		'height',
		'length_class',
		'weight',
		'weight_class',
		'image',
                'photo_url',
	];
	public function checkouts()
	{
		return $this->hasMany(Checkout::class);
	}

	public function product_categories()
	{
		return $this->hasMany(ProductCategory::class);
	}

	public function return_orders()
	{
		return $this->hasMany(ReturnOrder::class);
	}
}
