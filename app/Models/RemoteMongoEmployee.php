<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;

class RemoteMongoEmployee extends MongoModel
{
    protected $connection = 'mongodb_remote';
    protected $collection = 'employees';
}
