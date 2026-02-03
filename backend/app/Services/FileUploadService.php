<?php

namespace  App\Services;

use App\Models\Media;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class FileUploadService
{
    public $media_ids = array();

    /**
     * File store
     * @param $files
     * @return array
     */
    public  function store($files)
    {

        $this->media_ids =  [];
        if (is_array($files)) {
            foreach ($files as $file) {
                $this->uploadStructure($file);
            }
            return $this->media_ids;
        } else {
            $this->uploadStructure($files);
            if (isset($this->media_ids[0])) {
                return $this->media_ids[0];
            }
            return null;
        }
    }

    public function uploadStructure($file)
    {
        // Define upload path
        if (!file_exists(public_path('/uploads/'))) {
            mkdir(public_path('/uploads/'), 0777, true);
        }
        $storePath = public_path('/uploads/');
        $min_types = $file->getClientMimeType();
        $min_type = explode('/', $min_types);
        $file_name = time() . $file->getClientOriginalName();
        // Sanitize filename: remove invalid characters for Windows file paths
        // Invalid characters: < > : " / \ | ? *
        $fileNameWithoutSpaces = Str::of($file_name)
            ->replace(' ', '_')
            ->replace(':', '_')
            ->replace('<', '_')
            ->replace('>', '_')
            ->replace('"', '_')
            ->replace('/', '_')
            ->replace('\\', '_')
            ->replace('|', '_')
            ->replace('?', '_')
            ->replace('*', '_');

        if ($min_type[0] == 'image') {
            $this->uploadImage($file, $fileNameWithoutSpaces, $storePath);
        } elseif ($min_type[0] == 'video') {
            $this->uploadVideo($file, $fileNameWithoutSpaces, $storePath);
        } else {
            $file->move($storePath, $fileNameWithoutSpaces);
            $media_id = $this->saveFiles($file, $fileNameWithoutSpaces, $storePath);
            $this->media_ids[] = $media_id;
        }
    }

    /**
     * Upload Images
     * @param $originalImage \Illuminate\Http\UploadedFile
     * @param string $file_name
     * @param string $storePath
     */
    private function uploadImage($originalImage, string $file_name, string $storePath)
    {
        $manager = ImageManager::gd();
        $image = $manager->read($originalImage);

        // Apply EXIF orientation so image displays correctly
        $image->orient();

        // Save full-size file
        $image->save($storePath . $file_name);
        $media_id = $this->saveFiles($originalImage, $file_name, $storePath);
        $this->media_ids[] = $media_id;

        // Resize and save thumbnails (scale down keeping aspect ratio, no upsize)
        $sizes = [200, 400, 800, 1200];
        foreach ($sizes as $size) {
            $thumb = clone $image;
            $thumb->scaleDown($size, $size);
            $thumb->save($storePath . $size . '-' . $file_name);

            $this->saveThumbnail($media_id, $size, $file_name);
        }
    }

    /**
     * Upload Video
     * @param $file
     * @param string $file_name
     * @param string $storePath
     */
    private function uploadVideo($file, string $file_name, string $storePath)
    {
        $file->move($storePath, $file_name);
        $media_id = $this->saveFiles($file,  $file_name,  $storePath);
        $this->media_ids[] = $media_id;

        $ffmpeg = config('app.ffmpeg_path');
        $image_name = '400_' . $file_name . '.jpg';
        $interval = 2;
        $size = '200x200';
        $video_path = $storePath . $file_name;
        $cmd = "$ffmpeg -i $video_path -deinterlace -an -ss $interval -f mjpeg -t 1 -r 1 -y -s $size $image_name 2>&1";
        exec($cmd);
        rename(public_path('/') . $image_name, $storePath . '200-' . $image_name);
        $this->saveThumbnail($media_id, 200, $image_name);
    }

    /**
     * Save File
     * @param $file
     * @param $file_name
     * @param $storePath
     * @return int
     */
    public function saveFiles($file, $file_name, $storePath)
    {
        // Ensure file exists before getting size
        $filePath = $storePath . $file_name;
        $fileSize = 0;
        if (file_exists($filePath)) {
            $fileSize = File::size($filePath);
        }
        
        $media =  Media::create([
            'real_name' => $file->getClientOriginalName(),
            'url' => asset('uploads/' . $file_name),
            'file_name' => $file_name,
            'type' => $file->getClientMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'path' => $storePath,
            'size' => $fileSize,
            'is_active' => 1,
        ]);
        return $media->id;
    }

    /**
     * Save Thumbnail
     * @param $media_id
     * @param $size
     * @param $file_name
     */
    public function saveThumbnail($media_id, $size, $file_name)
    {
        $thumbnail = (new \App\Models\MediaThumbnails)->createThumbnail([
            'media_id' => $media_id,
            'size' => $size,
            'thumb_url' => asset('uploads/' . $size . '-' . $file_name)
        ]);
        return $thumbnail;
    }


public function storeBinaryFile($image)
{
    $storePath = public_path('\uploads\\');
    // Split the string based on comma
    $part = explode(',', $image);
    // Get the first part
    $prefix = $part[0];
    $format = explode('/', explode(';', explode(':', $prefix)[1])[0])[1];
    $fileExtension = trim($format);
    $image = str_replace($prefix, '', $image);
    $image = str_replace(' ', '+', $image);

    // Decode the base64 image data
    $imageData = base64_decode($image);

    // Generate a unique file name using the current timestamp and a random string
    $originalFileName = 'web-cam';
    $uniqueFileName = $originalFileName . '_' . time() . '_' . uniqid('', true) . '.' . $fileExtension;

// Save the image to the storage path
    File::put(public_path('uploads/') . $uniqueFileName, $imageData);

// Create the Media record
    $media = Media::create([
        'real_name' => $originalFileName . '.' . $fileExtension,
        'url' => asset('uploads/' . $uniqueFileName),
        'file_name' => $uniqueFileName,
        'type' => 'image/' . $fileExtension,
        'extension' => $fileExtension,
        'path' => $storePath,
        'size' => File::size(public_path('uploads/') . $uniqueFileName),
        'is_active' => 1,
    ]);

// Now, you can use $uniqueFileName and $fileExtension as needed.
    return $media->id;
}


}
