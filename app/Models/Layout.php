<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Layout
 *
 * @property int $id
 * @property int $product_category_id
 * @property string|null $background_path
 * @property int $canvas_width
 * @property int $canvas_height
 * @property array|null $zones
 */
class Layout extends Model
{
    protected $table = 'layouts';

    protected $casts = [
        'product_category_id' => 'int',
        'canvas_width'        => 'int',
        'canvas_height'       => 'int',
        'zones'               => 'array',
    ];

    protected $fillable = [
        'product_category_id',
        'background_path',
        'canvas_width',
        'canvas_height',
        'zones',
    ];

    public function productCategory()
    {
        return $this->belongsTo(ProductCategory::class);
    }
}
