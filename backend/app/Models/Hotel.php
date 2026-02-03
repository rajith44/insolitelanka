<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'highlights',
        'price_range_min',
        'price_range_max',
        'star',
        'main_media_id',
    ];

    protected $casts = [
        'price_range_min' => 'decimal:2',
        'price_range_max' => 'decimal:2',
    ];

    public function mainMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'main_media_id');
    }

    public function gallery(): HasMany
    {
        return $this->hasMany(HotelGallery::class)->orderBy('sort_order');
    }
}
