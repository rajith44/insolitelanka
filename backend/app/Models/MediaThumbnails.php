<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class MediaThumbnails extends Model
{
    use HasFactory;
    protected $table = 'media_thumbnails';
    public $timestamps = false;

    protected $casts = [
        'media_id' => 'int',
        'size' => 'int'
    ];

    protected $fillable = [
        'media_id',
        'size',
    ];

    public function createThumbnail($data)
    {
        return DB::table('media_thumbnails')
            ->insertGetId($data);
    }


    public static function getResizeThumbnail($size, $media_id)
    {

        return DB::table('media_thumbnails')
            ->select('media_thumbnails.thumb_url')
            ->where('media_thumbnails.media_id',$media_id)
            ->where('media_thumbnails.size',$size)
            ->first();
    }
}
