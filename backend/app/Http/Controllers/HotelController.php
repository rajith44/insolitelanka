<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\HotelGallery;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HotelController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function index(): JsonResponse
    {
        $hotels = Hotel::with(['mainMedia', 'gallery.media'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn (Hotel $h) => $this->formatHotel($h));

        return response()->json($hotels);
    }

    public function show(string $id): JsonResponse
    {
        $hotel = Hotel::with(['mainMedia', 'gallery.media'])->find($id);
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }
        return response()->json($this->formatHotel($hotel));
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'highlights' => ['nullable', 'string', 'max:500'],
            'price_range_min' => ['nullable', 'numeric', 'min:0'],
            'price_range_max' => ['nullable', 'numeric', 'min:0'],
            'star' => ['required', 'integer', 'min:1', 'max:5'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $mainMediaId = null;
        if ($request->hasFile('main_image')) {
            $mainMediaId = $this->fileUploadService->store($request->file('main_image'));
        }

        $hotel = Hotel::create([
            'name' => $request->input('name'),
            'slug' => $request->input('slug', ''),
            'description' => $request->input('description'),
            'highlights' => $request->input('highlights'),
            'price_range_min' => $request->input('price_range_min', 0),
            'price_range_max' => $request->input('price_range_max', 0),
            'star' => (int) $request->input('star', 3),
            'main_media_id' => $mainMediaId,
        ]);

        $this->syncGallery($hotel, $request);

        $hotel->load(['mainMedia', 'gallery.media']);
        return response()->json($this->formatHotel($hotel), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $hotel = Hotel::find($id);
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'highlights' => ['nullable', 'string', 'max:500'],
            'price_range_min' => ['nullable', 'numeric', 'min:0'],
            'price_range_max' => ['nullable', 'numeric', 'min:0'],
            'star' => ['sometimes', 'required', 'integer', 'min:1', 'max:5'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = [
            'name' => $request->input('name', $hotel->name),
            'slug' => $request->input('slug', $hotel->slug),
            'description' => $request->input('description', $hotel->description),
            'highlights' => $request->input('highlights', $hotel->highlights),
            'price_range_min' => $request->input('price_range_min', $hotel->price_range_min),
            'price_range_max' => $request->input('price_range_max', $hotel->price_range_max),
            'star' => (int) $request->input('star', $hotel->star),
        ];

        if ($request->hasFile('main_image')) {
            $data['main_media_id'] = $this->fileUploadService->store($request->file('main_image'));
        }

        $hotel->update($data);
        $this->syncGallery($hotel, $request);

        $hotel->load(['mainMedia', 'gallery.media']);
        return response()->json($this->formatHotel($hotel));
    }

    public function destroy(string $id): JsonResponse
    {
        $hotel = Hotel::find($id);
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }
        $hotel->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function syncGallery(Hotel $hotel, Request $request): void
    {
        $existingMediaIds = $request->input('gallery_media_ids', []);
        if (!is_array($existingMediaIds)) {
            $existingMediaIds = [];
        }
        $galleryFiles = $request->file('gallery_images', []);

        $hotel->gallery()->delete();

        $order = 0;
        foreach ($existingMediaIds as $mediaId) {
            HotelGallery::create([
                'hotel_id' => $hotel->id,
                'media_id' => (int) $mediaId,
                'sort_order' => $order++,
            ]);
        }
        foreach (is_array($galleryFiles) ? $galleryFiles : [$galleryFiles] as $file) {
            if ($file && $file->isValid()) {
                $mediaId = $this->fileUploadService->store($file);
                HotelGallery::create([
                    'hotel_id' => $hotel->id,
                    'media_id' => $mediaId,
                    'sort_order' => $order++,
                ]);
            }
        }
    }

    private function formatHotel(Hotel $h): array
    {
        $mainUrl = $h->mainMedia?->url ?? null;
        $imageUrls = $h->gallery->map(fn ($g) => $g->media?->url ?? null)->filter()->values()->toArray();

        return [
            'id' => (string) $h->id,
            'name' => $h->name,
            'slug' => $h->slug ?? '',
            'description' => $h->description,
            'highlights' => $h->highlights,
            'priceRangeMin' => (float) $h->price_range_min,
            'priceRangeMax' => (float) $h->price_range_max,
            'star' => (int) $h->star,
            'mainImageUrl' => $mainUrl,
            'main_media_id' => $h->main_media_id,
            'imageUrls' => $imageUrls,
            'gallery_media_ids' => $h->gallery->pluck('media_id')->toArray(),
            'createdAt' => $h->created_at?->toIso8601String(),
            'updatedAt' => $h->updated_at?->toIso8601String(),
        ];
    }
}
