<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourItineraryMedia extends Model
{
    protected $table = 'tour_itinerary_media';

    protected $fillable = [
        'tour_itinerary_id',
        'media_id',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function tourItinerary(): BelongsTo
    {
        return $this->belongsTo(TourItinerary::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
