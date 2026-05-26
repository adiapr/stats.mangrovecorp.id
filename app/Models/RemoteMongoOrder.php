<?php

namespace App\Models;

// GANTI BAGIAN INI: Gunakan model khusus milik package MongoDB Laravel
use MongoDB\Laravel\Eloquent\Model as MongoModel; 

class RemoteMongoOrder extends MongoModel
{
    // Ini sudah benar
    protected $connection = 'mongodb_remote'; 
    protected $collection = 'orders';
}