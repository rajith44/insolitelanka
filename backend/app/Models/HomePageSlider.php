<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomePageSlider extends Model
{
    protected $table = 'home_page_sliders';

    protected $fillable = [
        'media_id',
        'topname',
        'title',
        'subtitle',
        'sort_order',
    ];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }
}
