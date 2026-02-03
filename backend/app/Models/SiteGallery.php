<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteGallery extends Model
{
    protected $table = 'site_gallery';

    protected $fillable = [
        'media_id',
        'sort_order',
    ];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
