<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeTestimonial extends Model
{
    protected $table = 'home_testimonials';

    protected $fillable = [
        'person_name',
        'country',
        'date',
        'person_comment',
        'rating',
        'sort_order',
    ];

    protected $casts = [
        'rating' => 'integer',
        'sort_order' => 'integer',
    ];
}
