<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tour extends Model
{
    protected $table = 'tours';

    protected $fillable = [
        'category_ids',
        'title',
        'slug',
        'short_title',
        'description',
        'main_media_id',
        'price_per_person',
        'duration',
        'max_people',
        'country_id',
        'included',
        'excluded',
        'highlights',
        'map_embed',
        'video_url',
        'itinerary',
        'faq',
        'extra_services',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'itinerary' => 'array',
        'faq' => 'array',
        'extra_services' => 'array',
        'price_per_person' => 'float',
        'max_people' => 'integer',
    ];

    public function mainMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'main_media_id');
    }

    public function gallery(): HasMany
    {
        return $this->hasMany(TourGallery::class)->orderBy('sort_order');
    }

    public function itineraryItems(): HasMany
    {
        return $this->hasMany(TourItinerary::class, 'tour_id')->orderBy('sort_order');
    }

    public function destinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class, 'tour_destinations')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order')
            ->withTimestamps();
    }

    public function hotels(): BelongsToMany
    {
        return $this->belongsToMany(Hotel::class, 'tour_hotels')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order')
            ->withTimestamps();
    }
}
