<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class OrderPhoto
 *
 * @property int $id
 * @property int $order_id
 * @property string $path
 * @property string $image_name
 * @property string|null $thumbnail_path
 * @property string|null $thumbnail_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Order $order
 */
class OrderPhoto extends Model
{
    protected $table = 'order_photos';

    protected $casts = [
        'order_id' => 'int',
    ];

    protected $fillable = [
        'order_id',
        'path',
        'image_name',
        'thumbnail_path',
        'thumbnail_name',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
