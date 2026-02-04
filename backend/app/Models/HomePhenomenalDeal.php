<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomePhenomenalDeal extends Model
{
    protected $table = 'home_phenomenal_deals';

    protected $fillable = [
        'section_badge',
        'section_heading',
        'card1_media_id', 'card1_label', 'card1_title', 'card1_subtitle', 'card1_link_url', 'card1_link_text', 'card1_offer_badge',
        'card2_media_id', 'card2_label', 'card2_title', 'card2_subtitle', 'card2_link_url', 'card2_link_text', 'card2_offer_badge',
        'card3_media_id', 'card3_label', 'card3_title', 'card3_subtitle', 'card3_link_url', 'card3_link_text', 'card3_offer_badge',
        'card4_media_id', 'card4_label', 'card4_title', 'card4_subtitle', 'card4_link_url', 'card4_link_text', 'card4_offer_badge',
    ];

    public function card1Media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'card1_media_id');
    }

    public function card2Media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'card2_media_id');
    }

    public function card3Media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'card3_media_id');
    }

    public function card4Media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'card4_media_id');
    }
}
