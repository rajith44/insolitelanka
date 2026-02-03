<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'country_id',
        'main_description',
        'sub_title',
        'sub_description',
        'main_media_id',
    ];

    public function mainMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'main_media_id');
    }

    public function highlights(): HasMany
    {
        return $this->hasMany(DestinationHighlight::class)->orderBy('sort_order');
    }

    public function gallery(): HasMany
    {
        return $this->hasMany(DestinationGallery::class)->orderBy('sort_order');
    }

    public function tours(): BelongsToMany
    {
        return $this->belongsToMany(Tour::class, 'tour_destinations')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order')
            ->withTimestamps();
    }
}
