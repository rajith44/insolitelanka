<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\DestinationGallery;
use App\Models\DestinationHighlight;
use App\Models\Tour;
use App\Services\FileUploadService;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DestinationController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService,
        private MenuService $menuService
    ) {}

    /**
     * Destination menu: countries with their places (for nav / dropdown).
     * GET /api/destinations/menu
     */
    public function menu(): JsonResponse
    {
        return response()->json($this->menuService->getDestinationMenu());
    }

    /**
     * List destinations with media relations.
     */
    public function index(): JsonResponse
    {
        $destinations = Destination::with(['mainMedia', 'highlights.media', 'gallery.media'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn (Destination $d) => $this->formatDestination($d));

        return response()->json($destinations);
    }

    /**
     * Get one destination.
     */
    public function show(string $id): JsonResponse
    {
        $destination = Destination::with(['mainMedia', 'highlights.media', 'gallery.media'])->find($id);
        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }
        return response()->json($this->formatDestination($destination));
    }

    /**
     * Get destination by slug with tours (for destination detail page).
     * GET /api/destinations/slug/{slug}
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $destination = Destination::with(['mainMedia', 'highlights.media', 'gallery.media', 'tours.mainMedia'])
            ->where('slug', $slug)
            ->first();

        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }

        $tours = $destination->tours->map(fn (Tour $t) => $this->formatTourForList($t));

        return response()->json([
            'destination' => $this->formatDestination($destination),
            'tours' => $tours->values()->toArray(),
        ]);
    }

    /**
     * Create destination with image uploads.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'country_id' => ['required', 'string', 'max:10'],
            'main_description' => ['nullable', 'string'],
            'sub_title' => ['nullable', 'string', 'max:200'],
            'sub_description' => ['nullable', 'string'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $mainMediaId = null;
        if ($request->hasFile('main_image')) {
            $mainMediaId = $this->fileUploadService->store($request->file('main_image'));
        }

        $destination = Destination::create([
            'title' => $request->input('title'),
            'slug' => $request->input('slug', ''),
            'country_id' => $request->input('country_id'),
            'main_description' => $request->input('main_description'),
            'sub_title' => $request->input('sub_title'),
            'sub_description' => $request->input('sub_description'),
            'main_media_id' => $mainMediaId,
        ]);

        $this->syncHighlights($destination, $request);
        $this->syncGallery($destination, $request);

        $destination->load(['mainMedia', 'highlights.media', 'gallery.media']);
        return response()->json($this->formatDestination($destination), 201);
    }

    /**
     * Update destination and optional image uploads.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'country_id' => ['sometimes', 'required', 'string', 'max:10'],
            'main_description' => ['nullable', 'string'],
            'sub_title' => ['nullable', 'string', 'max:200'],
            'sub_description' => ['nullable', 'string'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = [
            'title' => $request->input('title', $destination->title),
            'slug' => $request->input('slug', $destination->slug),
            'country_id' => $request->input('country_id', $destination->country_id),
            'main_description' => $request->input('main_description', $destination->main_description),
            'sub_title' => $request->input('sub_title', $destination->sub_title),
            'sub_description' => $request->input('sub_description', $destination->sub_description),
        ];

        if ($request->hasFile('main_image')) {
            $data['main_media_id'] = $this->fileUploadService->store($request->file('main_image'));
        }

        $destination->update($data);
        $this->syncHighlights($destination, $request);
        $this->syncGallery($destination, $request);

        $destination->load(['mainMedia', 'highlights.media', 'gallery.media']);
        return response()->json($this->formatDestination($destination));
    }

    /**
     * Delete destination (cascades to highlights and gallery).
     */
    public function destroy(string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }
        $destination->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function syncHighlights(Destination $destination, Request $request): void
    {
        $descriptions = $request->input('highlight_short_descriptions', []);
        if (!is_array($descriptions)) {
            $descriptions = [];
        }
        $destination->highlights()->delete();

        foreach ($descriptions as $i => $shortDescription) {
            $mediaId = null;
            if ($request->hasFile("highlight_images.{$i}") && $request->file("highlight_images.{$i}")->isValid()) {
                $mediaId = $this->fileUploadService->store($request->file("highlight_images.{$i}"));
            } elseif ($request->has("highlight_media_ids.{$i}")) {
                $mediaId = (int) $request->input("highlight_media_ids.{$i}");
            }
            DestinationHighlight::create([
                'destination_id' => $destination->id,
                'media_id' => $mediaId,
                'short_description' => $shortDescription,
                'sort_order' => $i,
            ]);
        }
    }

    private function syncGallery(Destination $destination, Request $request): void
    {
        $existingMediaIds = $request->input('gallery_media_ids', []);
        if (!is_array($existingMediaIds)) {
            $existingMediaIds = [];
        }
        $galleryFiles = $request->file('gallery_images', []);

        $destination->gallery()->delete();

        $order = 0;
        foreach ($existingMediaIds as $mediaId) {
            DestinationGallery::create([
                'destination_id' => $destination->id,
                'media_id' => (int) $mediaId,
                'sort_order' => $order++,
            ]);
        }
        foreach (is_array($galleryFiles) ? $galleryFiles : [$galleryFiles] as $file) {
            if ($file && $file->isValid()) {
                $mediaId = $this->fileUploadService->store($file);
                DestinationGallery::create([
                    'destination_id' => $destination->id,
                    'media_id' => $mediaId,
                    'sort_order' => $order++,
                ]);
            }
        }
    }

    private function formatDestination(Destination $d): array
    {
        $mainUrl = $d->mainMedia?->url ?? null;
        $highlights = $d->highlights->map(fn ($h) => [
            'media_id' => $h->media_id,
            'imageUrl' => $h->media?->url ?? null,
            'shortDescription' => $h->short_description,
        ])->toArray();
        $imageUrls = $d->gallery->map(fn ($g) => $g->media?->url ?? null)->filter()->values()->toArray();

        return [
            'id' => (string) $d->id,
            'title' => $d->title,
            'slug' => $d->slug ?? '',
            'countryId' => $d->country_id,
            'mainDescription' => $d->main_description,
            'subTitle' => $d->sub_title,
            'subDescription' => $d->sub_description,
            'mainImageUrl' => $mainUrl,
            'main_media_id' => $d->main_media_id,
            'destinationHighlights' => $highlights,
            'imageUrls' => $imageUrls,
            'gallery_media_ids' => $d->gallery->pluck('media_id')->toArray(),
            'createdAt' => $d->created_at?->toIso8601String(),
            'updatedAt' => $d->updated_at?->toIso8601String(),
        ];
    }

    private function formatTourForList(Tour $t): array
    {
        $categoryIds = $t->category_ids ?? [];
        if (!is_array($categoryIds)) {
            $categoryIds = [];
        }

        return [
            'id' => (string) $t->id,
            'slug' => $t->slug ?? '',
            'title' => $t->title,
            'shortTitle' => $t->short_title ?? '',
            'duration' => $t->duration ?? '',
            'pricePerPerson' => (float) $t->price_per_person,
            'mainImageUrl' => $t->mainMedia?->url ?? null,
            'categoryIds' => array_map('strval', $categoryIds),
        ];
    }
}
