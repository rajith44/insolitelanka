<?php

namespace App\Http\Controllers;

use App\Models\SiteGallery;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function index(): JsonResponse
    {
        $items = SiteGallery::with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SiteGallery $g) => $this->formatItem($g));

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $files = $request->file('photos');
        $files = $files ? (is_array($files) ? $files : [$files]) : [];
        $mediaIds = $request->input('media_ids', []);
        $mediaIds = is_array($mediaIds) ? array_map('intval', array_filter($mediaIds)) : [];

        if (empty($files) && empty($mediaIds)) {
            return response()->json(['message' => 'No photos or media IDs provided'], 422);
        }

        $maxOrder = (int) SiteGallery::max('sort_order');
        $created = [];

        foreach ($files as $file) {
            if (! $file->isValid()) {
                continue;
            }
            $mediaId = $this->fileUploadService->store($file);
            if ($mediaId) {
                $maxOrder++;
                $item = SiteGallery::create([
                    'media_id' => $mediaId,
                    'sort_order' => $maxOrder,
                ]);
                $item->load('media');
                $created[] = $this->formatItem($item);
            }
        }

        foreach ($mediaIds as $mediaId) {
            if ($mediaId > 0) {
                $maxOrder++;
                $item = SiteGallery::create([
                    'media_id' => $mediaId,
                    'sort_order' => $maxOrder,
                ]);
                $item->load('media');
                $created[] = $this->formatItem($item);
            }
        }

        return response()->json($created, 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $item = SiteGallery::find($id);
        if (! $item) {
            return response()->json(['message' => 'Gallery item not found'], 404);
        }
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function formatItem(SiteGallery $g): array
    {
        return [
            'id' => (string) $g->id,
            'media_id' => $g->media_id,
            'imageUrl' => $g->media?->url ?? null,
            'sortOrder' => (int) $g->sort_order,
            'createdAt' => $g->created_at?->toIso8601String(),
        ];
    }
}
