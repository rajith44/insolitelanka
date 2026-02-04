<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeTestimonialSection extends Model
{
    protected $table = 'home_testimonial_section';

    protected $fillable = [
        'section_badge',
        'section_heading',
    ];
}
