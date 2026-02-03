<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourItinerary extends Model
{
    protected $table = 'tour_itineraries';

    protected $fillable = [
        'tour_id',
        'day',
        'title',
        'content',
        'day_highlights',
        'day_activities',
        'from_city',
        'to_city',
        'travel_mileage_km',
        'destination_ids',
        'hotel_ids',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'destination_ids' => 'array',
        'hotel_ids' => 'array',
        'travel_mileage_km' => 'decimal:2',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(TourItineraryMedia::class, 'tour_itinerary_id')->orderBy('sort_order');
    }
}
