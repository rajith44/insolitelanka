<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourCategory extends Model
{
    protected $table = 'tour_categories';

    protected $fillable = [
        'parent_id',
        'title',
        'slug',
        'short_description',
        'media_id',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(TourCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(TourCategory::class, 'parent_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
