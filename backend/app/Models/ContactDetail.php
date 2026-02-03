<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactDetail extends Model
{
    protected $table = 'contact_details';

    protected $fillable = [
        'email',
        'phone',
        'address',
        'map_embed',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
    ];
}
