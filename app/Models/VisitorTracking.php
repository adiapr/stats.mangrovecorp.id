<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorTracking extends Model
{
    protected $table = 'visitor_trackings';

    protected $fillable = [
        'ip_address',
        'url',
        'referrer',
        'device',
        'platform',
        'browser',
        'user_agent',
        'location',
        'city',
        'region',
        'country',
    ];
}
