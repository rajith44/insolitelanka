<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $casts = [
        'restaurant_id' => 'int',
        'size' => 'float',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'created_user_id' => 'int',
        'updated_user_id' => 'int'
    ];

    protected $fillable = [
        'media_ref',
        'restaurant_id',
        'file_name',
        'real_name',
        'extension',
        'type',
        'path',
        'url',
        'size',
        'is_active',
        'created_at',
        'updated_at',
        'created_user_id',
        'updated_user_id'
    ];
}
