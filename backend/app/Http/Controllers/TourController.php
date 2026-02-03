<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Hotel;
use App\Models\Tour;
use App\Models\TourCategory;
use App\Models\TourGallery;
use App\Models\TourItinerary;
use App\Models\TourItineraryMedia;
use App\Services\FileUploadService;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TourController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService,
        private MenuService $menuService
    ) {}

    /**
     * Tour menu: categories with featured tours (for nav / dropdown).
     * GET /api/tours/menu
     */
    public function menu(): JsonResponse
    {
        return response()->json($this->menuService->getTourMenu());
    }

    /**
     * List tours. Optional query: category_slug — filter by tour category slug.
     * GET /api/tours
     * GET /api/tours?category_slug=adventure
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tour::with(['mainMedia', 'gallery.media', 'itineraryItems.media.media', 'destinations.mainMedia', 'destinations.highlights.media', 'destinations.gallery.media', 'hotels.mainMedia', 'hotels.gallery.media'])
            ->orderBy('updated_at', 'desc');

        $categorySlug = $request->query('category_slug');
        $category = null;
        if ($categorySlug !== null && $categorySlug !== '') {
            $category = TourCategory::where('slug', $categorySlug)->first();
            if ($category) {
                $categoryId = (string) $category->id;
                $query->where(function ($q) use ($categoryId) {
                    $q->whereJsonContains('category_ids', $categoryId)
                        ->orWhereJsonContains('category_ids', (int) $categoryId);
                });
            }
        }

        $tours = $query->get()->map(fn (Tour $t) => $this->formatTour($t));

        if ($category !== null) {
            return response()->json([
                'category' => [
                    'id' => (string) $category->id,
                    'title' => $category->title ?? '',
                    'slug' => $category->slug ?? '',
                ],
                'tours' => $tours,
            ]);
        }

        return response()->json($tours);
    }

    public function homePageTours(): JsonResponse
    {
        $tour = Tour::with(['mainMedia', 'gallery.media', 'itineraryItems.media.media', 'destinations.mainMedia', 'destinations.highlights.media', 'destinations.gallery.media', 'hotels.mainMedia', 'hotels.gallery.media'])->where('slug', $slug)->first();
        if (!$tour) {
            return response()->json(['message' => 'Tour not found'], 404);
        }
        return response()->json($this->formatTour($tour, true));
    }

    public function show(string $id): JsonResponse
    {
        $tour = Tour::with(['mainMedia', 'gallery.media', 'itineraryItems.media.media', 'destinations.mainMedia', 'destinations.highlights.media', 'destinations.gallery.media', 'hotels.mainMedia', 'hotels.gallery.media'])->find($id);
        if (!$tour) {
            return response()->json(['message' => 'Tour not found'], 404);
        }
        return response()->json($this->formatTour($tour, true));
    }

    /**
     * Get a single tour by slug (for public website).
     * GET /api/tours/slug/{slug}
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $tour = Tour::with(['mainMedia', 'gallery.media', 'itineraryItems.media.media', 'destinations.mainMedia', 'destinations.highlights.media', 'destinations.gallery.media', 'hotels.mainMedia', 'hotels.gallery.media'])->where('slug', $slug)->first();

        if (!$tour) {
            return response()->json(['message' => 'Tour not found'], 404);
        }

        // included/excluded/highlights: support textarea (one item per line) or JSON array
        // $tour->included = $this->parseLinesOrJson($tour->included);
        // $tour->excluded = $this->parseLinesOrJson($tour->excluded);
        // $tour->highlights = $this->parseLinesOrJson($tour->highlights);

        return response()->json($this->formatTour($tour));
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'short_title' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'price_per_person' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'string', 'max:100'],
            'max_people' => ['nullable', 'integer', 'min:0'],
            'country_id' => ['nullable', 'string', 'max:10'],
            'included' => ['nullable', 'string'],
            'excluded' => ['nullable', 'string'],
            'highlights' => ['nullable', 'string'],
            'map_embed' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $mainMediaId = null;
        if ($request->hasFile('main_image')) {
            $mainMediaId = $this->fileUploadService->store($request->file('main_image'));
        }

        $categoryIds = $this->parseJsonInput($request->input('category_ids'));
        $faq = $this->parseJsonInput($request->input('faq'));
        $extraServices = $this->parseJsonInput($request->input('extra_services'));


        $tour = Tour::create([
            'category_ids' => $categoryIds,
            'title' => $request->input('title'),
            'slug' => $request->input('slug') ?: \Illuminate\Support\Str::slug($request->input('title')),
            'short_title' => $request->input('short_title'),
            'description' => $request->input('description'),
            'main_media_id' => $mainMediaId,
            'price_per_person' => (float) ($request->input('price_per_person') ?? 0),
            'duration' => $request->input('duration'),
            'max_people' => (int) ($request->input('max_people') ?? 0),
            'country_id' => $request->input('country_id'),
            'included' => $request->input('included'),
            'excluded' => $request->input('excluded'),
            'highlights' => $request->input('highlights'),
            'map_embed' => $request->input('map_embed'),
            'video_url' => $request->input('video_url'),
            'faq' => $faq,
            'extra_services' => $extraServices,
        ]);

        $this->syncItinerary($tour, $request);
        $this->syncDestinations($tour, $request);
        $this->syncHotels($tour, $request);
        $this->syncGallery($tour, $request);

        $tour->load(['mainMedia', 'gallery.media', 'itineraryItems.media.media', 'destinations.mainMedia', 'destinations.highlights.media', 'destinations.gallery.media', 'hotels.mainMedia', 'hotels.gallery.media']);
        return response()->json($this->formatTour($tour), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tour = Tour::find($id);
        if (!$tour) {
            return response()->json(['message' => 'Tour not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'short_title' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'price_per_person' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'string', 'max:100'],
            'max_people' => ['nullable', 'integer', 'min:0'],
            'country_id' => ['nullable', 'string', 'max:10'],
            'included' => ['nullable', 'string'],
            'excluded' => ['nullable', 'string'],
            'highlights' => ['nullable', 'string'],
            'map_embed' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = [
            'title' => $request->input('title', $tour->title),
            'slug' => $request->input('slug', $tour->slug),
            'short_title' => $request->input('short_title', $tour->short_title),
            'description' => $request->input('description', $tour->description),
            'price_per_person' => (float) ($request->input('price_per_person') ?? $tour->price_per_person),
            'duration' => $request->input('duration', $tour->duration),
            'max_people' => (int) ($request->input('max_people') ?? $tour->max_people),
            'country_id' => $request->input('country_id', $tour->country_id),
            'included' => $request->input('included', $tour->included),
            'excluded' => $request->input('excluded', $tour->excluded),
            'highlights' => $request->input('highlights', $tour->highlights),
            'map_embed' => $request->input('map_embed', $tour->map_embed),
            'video_url' => $request->input('video_url', $tour->video_url),
        ];

        if ($request->has('category_ids')) {
            $data['category_ids'] = $this->parseJsonInput($request->input('category_ids'));
        }
        if ($request->has('faq')) {
            $data['faq'] = $this->parseJsonInput($request->input('faq'));
        }
        if ($request->has('extra_services')) {
            $data['extra_services'] = $this->parseJsonInput($request->input('extra_services'));
        }

        if ($request->hasFile('main_image')) {
            $data['main_media_id'] = $this->fileUploadService->store($request->file('main_image'));
        }

        $tour->update($data);
        if ($request->has('itinerary')) {
            $this->syncItinerary($tour, $request);
        }
        if ($request->has('destination_ids') || $request->has('destinationIds')) {
            $this->syncDestinations($tour, $request);
        }
        if ($request->has('hotel_ids') || $request->has('hotelIds')) {
            $this->syncHotels($tour, $request);
        }
        $this->syncGallery($tour, $request);

        $tour->load(['mainMedia', 'gallery.media', 'itineraryItems.media.media', 'destinations.mainMedia', 'destinations.highlights.media', 'destinations.gallery.media', 'hotels.mainMedia', 'hotels.gallery.media']);
        return response()->json($this->formatTour($tour, true));
    }

    public function destroy(string $id): JsonResponse
    {
        $tour = Tour::find($id);
        if (!$tour) {
            return response()->json(['message' => 'Tour not found'], 404);
        }
        $tour->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function parseJsonInput(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }

    /**
     * Parse value as JSON array, or as newline-separated text (textarea: one item per line).
     * Returns array of strings.
     */
    private function parseLinesOrJson(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_map('strval', $value));
        }
        if (!is_string($value) || $value === '') {
            return [];
        }

       //  $value is a string import uisng , 
       $lines = explode(',', $value);

       foreach ($lines as $line) {
        $line = trim($line);
        if ($line !== '') {
            $result[] = $line;
        }
       }
        $decoded = json_decode($value, true);
        if (is_array($decoded)) {
            return array_values(array_map('strval', $decoded));
        }
        // Plain textarea: one item per line
        $lines = preg_split('/\r\n|\r|\n/', $value);
        return array_values(array_filter(array_map('trim', $lines), fn ($line) => $line !== ''));
    }

    /**
     * Sync itinerary from request: save to tour_itineraries and tour_itinerary_media.
     * Expects itinerary as array of { day, title?, mainTitle?, content?, description?, images?: UploadedFile[], image_media_ids?, imageMediaIds?, media_ids? }.
     */
    private function syncItinerary(Tour $tour, Request $request): void
    {
        $tour->itineraryItems()->delete();

        $items = $this->parseJsonInput($request->input('itinerary'));
        if (!is_array($items)) {
            $items = [];
        }
        $items = array_values($items); // ensure 0-based numeric keys for file lookup
        if (empty($items)) {
            return;
        }

        $sortOrder = 0;
        foreach ($items as $index => $item) {
            if (!is_array($item)) {
                continue;
            }
            $title = $item['title'] ?? $item['mainTitle'] ?? null;
            $content = $item['content'] ?? $item['description'] ?? null;
            $day = isset($item['day']) ? (string) $item['day'] : null;
            $dayHighlights = isset($item['day_highlights']) ? (string) $item['day_highlights'] : (isset($item['dayHighlights']) ? (string) $item['dayHighlights'] : null);
            $dayActivities = isset($item['day_activities']) ? (string) $item['day_activities'] : (isset($item['dayActivities']) ? (string) $item['dayActivities'] : null);
            $fromCity = isset($item['from_city']) ? (string) $item['from_city'] : (isset($item['fromCity']) ? (string) $item['fromCity'] : null);
            $toCity = isset($item['to_city']) ? (string) $item['to_city'] : (isset($item['toCity']) ? (string) $item['toCity'] : null);
            $travelMileageKm = isset($item['travel_mileage_km']) ? (float) $item['travel_mileage_km'] : (isset($item['travelMileageKm']) ? (float) $item['travelMileageKm'] : null);
            $destinationIds = $this->normalizeIdListFromItem($item, 'destination_ids', 'destinationIds');
            $hotelIds = $this->normalizeIdListFromItem($item, 'hotel_ids', 'hotelIds');

            $itinerary = TourItinerary::create([
                'tour_id' => $tour->id,
                'day' => $day,
                'title' => $title,
                'content' => $content,
                'day_highlights' => $dayHighlights ?: null,
                'day_activities' => $dayActivities ?: null,
                'from_city' => $fromCity ? trim($fromCity) : null,
                'to_city' => $toCity ? trim($toCity) : null,
                'travel_mileage_km' => $travelMileageKm,
                'destination_ids' => $destinationIds,
                'hotel_ids' => $hotelIds,
                'sort_order' => $sortOrder++,
            ]); 

            // Existing media IDs (accept snake_case and camelCase)
            $mediaIds = $item['image_media_ids'] ?? $item['imageMediaIds'] ?? $item['media_ids'] ?? $item['mediaIds'] ?? [];
            if (!is_array($mediaIds)) {
                $mediaIds = [];
            }

            $mediaOrder = 0;
            foreach ($mediaIds as $mediaId) {
                $id = is_array($mediaId) ? ($mediaId['id'] ?? $mediaId['media_id'] ?? null) : $mediaId;
                if ($id && (int) $id > 0) {
                    TourItineraryMedia::create([
                        'tour_itinerary_id' => $itinerary->id,
                        'media_id' => (int) $id,
                        'sort_order' => $mediaOrder++,
                    ]);
                }
            }

            // New uploaded images: itinerary[0][images][], itinerary.0.images, or itinerary[0][images]
            $files = $request->file('itinerary.' . $index . '.images')
                ?? $request->file('itinerary.' . $index . '.images.0')
                ?? (is_array($request->file('itinerary')) && isset($request->file('itinerary')[$index]['images'])
                    ? (array) $request->file('itinerary')[$index]['images']
                    : []) ?? [];
            if (!is_array($files)) {
                $files = $files ? [$files] : [];
            }
            foreach ($files as $file) {
                if ($file && method_exists($file, 'isValid') && $file->isValid()) {
                    $mediaId = $this->fileUploadService->store($file);
                    if ($mediaId) {
                        TourItineraryMedia::create([
                            'tour_itinerary_id' => $itinerary->id,
                            'media_id' => $mediaId,
                            'sort_order' => $mediaOrder++,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Normalize ID array from an itinerary item array (snake or camel keys).
     */
    private function normalizeIdListFromItem(array $item, string $snakeKey, string $camelKey): array
    {
        $raw = $item[$snakeKey] ?? $item[$camelKey] ?? [];
        $ids = is_string($raw) ? (json_decode($raw, true) ?? []) : (is_array($raw) ? $raw : []);
        if (!is_array($ids)) {
            return [];
        }
        $result = [];
        foreach ($ids as $entry) {
            if (is_array($entry) && isset($entry['id'])) {
                $result[] = (int) $entry['id'];
            } elseif (is_numeric($entry) && (int) $entry > 0) {
                $result[] = (int) $entry;
            }
        }
        return array_values(array_filter($result, fn ($id) => $id > 0));
    }

    /**
     * Normalize ID array from request: accept [1,2,3] or [{"id":1},{"id":2}] and destination_ids or destinationIds.
     */
    private function normalizeIdList(Request $request, string $snakeKey, string $camelKey): array
    {
        $raw = $request->input($snakeKey) ?? $request->input($camelKey);
        $ids = is_string($raw) ? (json_decode($raw, true) ?? []) : (is_array($raw) ? $raw : []);
        if (!is_array($ids)) {
            return [];
        }
        $result = [];
        foreach ($ids as $reqItem) {
            if (is_array($reqItem) && isset($reqItem['id'])) {
                $result[] = (int) $reqItem['id'];
            } elseif (is_numeric($reqItem) && (int) $reqItem > 0) {
                $result[] = (int) $reqItem;
            }
        }
        return array_values(array_filter($result, fn ($id) => $id > 0));
    }

    /**
     * Sync tour_destinations from request destination_ids or destinationIds (array of destination IDs).
     */
    private function syncDestinations(Tour $tour, Request $request): void
    {
        $ids = $this->normalizeIdList($request, 'destination_ids', 'destinationIds');
        $sync = [];
        foreach ($ids as $order => $destinationId) {
            $sync[$destinationId] = ['sort_order' => $order];
        }
        $tour->destinations()->sync($sync);
    }

    /**
     * Sync tour_hotels from request hotel_ids or hotelIds (array of hotel IDs).
     */
    private function syncHotels(Tour $tour, Request $request): void
    {
        $ids = $this->normalizeIdList($request, 'hotel_ids', 'hotelIds');
        $sync = [];
        foreach ($ids as $order => $hotelId) {
            $sync[$hotelId] = ['sort_order' => $order];
        }
        $tour->hotels()->sync($sync);
    }

    private function syncGallery(Tour $tour, Request $request): void
    {
        $existingMediaIds = $request->input('gallery_media_ids', []);
        if (!is_array($existingMediaIds)) {
            $existingMediaIds = [];
        }
        $galleryFiles = $request->file('gallery_images', []);

        $tour->gallery()->delete();

        $order = 0;
        foreach ($existingMediaIds as $mediaId) {
            TourGallery::create([
                'tour_id' => $tour->id,
                'media_id' => (int) $mediaId,
                'sort_order' => $order++,
            ]);
        }
        foreach (is_array($galleryFiles) ? $galleryFiles : [$galleryFiles] as $file) {
            if ($file && $file->isValid()) {
                $mediaId = $this->fileUploadService->store($file);
                TourGallery::create([
                    'tour_id' => $tour->id,
                    'media_id' => $mediaId,
                    'sort_order' => $order++,
                ]);
            }
        }
    }

    /**
     * Build itinerary array for API: from itineraryItems (with media) or legacy tours.itinerary JSON.
     * Each item includes full hotels and destinations with related images.
     */
    private function formatItinerary(Tour $t): array
    {
        if ($t->relationLoaded('itineraryItems') && $t->itineraryItems->isNotEmpty()) {
            return $t->itineraryItems->map(function ($item) {
                $imageUrls = $item->media->map(fn ($m) => $m->media?->url)->filter()->values()->toArray();
                $imageMediaIds = $item->media->pluck('media_id')->filter()->values()->toArray();
                $destinationIds = is_array($item->destination_ids) ? array_filter(array_map('intval', $item->destination_ids)) : [];
                $hotelIds = is_array($item->hotel_ids) ? array_filter(array_map('intval', $item->hotel_ids)) : [];

                $hotels = [];
                if (!empty($hotelIds)) {
                    $hotelModels = Hotel::with(['mainMedia', 'gallery.media'])
                        ->whereIn('id', $hotelIds)
                        ->orderByRaw('FIELD(id, ' . implode(',', $hotelIds) . ')')
                        ->get();
                    $hotels = $hotelModels->map(fn ($h) => $this->formatOneHotel($h))->toArray();
                }

                $destinations = [];
                if (!empty($destinationIds)) {
                    $destModels = Destination::with(['mainMedia', 'highlights.media', 'gallery.media'])
                        ->whereIn('id', $destinationIds)
                        ->orderByRaw('FIELD(id, ' . implode(',', $destinationIds) . ')')
                        ->get();
                    $destinations = $destModels->map(fn ($d) => $this->formatOneDestination($d))->toArray();
                }

                return [
                    'day' => $item->day ?? '',
                    'dayTitle' => $item->day ?? '',
                    'mainTitle' => $item->title ?? '',
                    'title' => $item->title ?? '',
                    'description' => $item->content ?? '',
                    'content' => $item->content ?? '',
                    'dayHighlights' => $item->day_highlights ?? '',
                    'day_highlights' => $this->parseLinesOrJson($item->day_highlights ?? ''),
                    'dayActivities' => $item->day_activities ?? '',
                    'day_activities' => $this->parseLinesOrJson($item->day_activities ?? ''),
                    'fromCity' => $item->from_city ?? '',
                    'from_city' => $item->from_city ?? '',
                    'toCity' => $item->to_city ?? '',
                    'to_city' => $item->to_city ?? '',
                    'travelMileageKm' => $item->travel_mileage_km !== null ? (float) $item->travel_mileage_km : null,
                    'travel_mileage_km' => $item->travel_mileage_km !== null ? (float) $item->travel_mileage_km : null,
                    'destinationIds' => array_map('strval', $destinationIds),
                    'hotelIds' => array_map('strval', $hotelIds),
                    'destinations' => $destinations,
                    'hotels' => $hotels,
                    'imageUrls' => $imageUrls,
                    'image_media_ids' => $imageMediaIds,
                ];
            })->toArray();
        }
        return $t->itinerary ?? [];
    }

    /**
     * Format a single hotel for API (with main image and gallery images).
     */
    private function formatOneHotel(Hotel $h): array
    {
        $imageUrls = $h->relationLoaded('gallery')
            ? $h->gallery->map(fn ($g) => $g->media?->url)->filter()->values()->toArray()
            : [];

        return [
            'id' => (string) $h->id,
            'name' => $h->name ?? '',
            'slug' => $h->slug ?? '',
            'description' => $h->description ?? '',
            'highlights' => $h->highlights ?? '',
            'priceRangeMin' => $h->price_range_min !== null ? (float) $h->price_range_min : null,
            'priceRangeMax' => $h->price_range_max !== null ? (float) $h->price_range_max : null,
            'star' => $h->star ?? null,
            'imageUrl' => $h->mainMedia?->url ?? null,
            'imageUrls' => $imageUrls,
        ];
    }

    /**
     * Format a single destination for API (with main image, highlights images, gallery images).
     */
    private function formatOneDestination(Destination $d): array
    {
        $highlights = $d->relationLoaded('highlights') ? $d->highlights->map(function ($h) {
            return [
                'description' => $h->short_description ?? '',
                'imageUrl' => $h->media?->url ?? null,
            ];
        })->toArray() : [];

        $imageUrls = $d->relationLoaded('gallery')
            ? $d->gallery->map(fn ($g) => $g->media?->url)->filter()->values()->toArray()
            : [];

        return [
            'id' => (string) $d->id,
            'title' => $d->title ?? '',
            'slug' => $d->slug ?? '',
            'countryId' => $d->country_id ?? '',
            'mainDescription' => $d->main_description ?? '',
            'subTitle' => $d->sub_title ?? '',
            'subDescription' => $d->sub_description ?? '',
            'imageUrl' => $d->mainMedia?->url ?? null,
            'imageUrls' => $imageUrls,
            'highlights' => $highlights,
        ];
    }

    /**
     * Format tour hotels for API (from hotels relation, with main + gallery images).
     */
    private function formatTourHotels(Tour $t): array
    {
        if (!$t->relationLoaded('hotels')) {
            return [];
        }
        return $t->hotels->map(fn ($h) => $this->formatOneHotel($h))->toArray();
    }

    /**
     * Format tour destinations for API (from destinations relation, with main + highlights + gallery images).
     */
    private function formatTourDestinations(Tour $t): array
    {
        if (!$t->relationLoaded('destinations')) {
            return [];
        }
        return $t->destinations->map(fn ($d) => $this->formatOneDestination($d))->toArray();
    }

    private function formatTour(Tour $t, $isEdit = false): array
    {
        $mainUrl = $t->mainMedia?->url ?? null;
        $imageUrls = $t->gallery->map(fn ($g) => $g->media?->url ?? null)->filter()->values()->toArray();

        return [
            'id' => (string) $t->id,
            'categoryIds' => $t->category_ids ?? [],
            'title' => $t->title,
            'slug' => $t->slug ?? '',
            'shortTitle' => $t->short_title ?? '',
            'description' => $t->description ?? '',
            'mainImageUrl' => $mainUrl,
            'main_media_id' => $t->main_media_id,
            'imageUrls' => $imageUrls,
            'gallery_media_ids' => $t->gallery->pluck('media_id')->toArray(),
            'pricePerPerson' => (float) $t->price_per_person,
            'duration' => $t->duration ?? '',
            'maxPeople' => (int) $t->max_people,
            'countryId' => $t->country_id ?? '',
            'included' => $isEdit ? $t->included : $this->parseLinesOrJson($t->included ?? ''),
            'excluded' => $isEdit ? $t->excluded : $this->parseLinesOrJson($t->excluded ?? ''),
            'highlights' => $isEdit ? $t->highlights : $this->parseLinesOrJson($t->highlights ?? ''),
            'mapEmbed' => $t->map_embed ?? '',
            'videoUrl' => $t->video_url ?? '',
            'itinerary' => $this->formatItinerary($t),
            'faq' => $t->faq ?? [],
            'extraServices' => $t->extra_services ?? [],
            'hotels' => $this->formatTourHotels($t),
            'destinations' => $this->formatTourDestinations($t),
            'destination_ids' => $t->relationLoaded('destinations') ? $t->destinations->pluck('id')->map(fn ($id) => (string) $id)->toArray() : [],
            'hotel_ids' => $t->relationLoaded('hotels') ? $t->hotels->pluck('id')->map(fn ($id) => (string) $id)->toArray() : [],
            'createdAt' => $t->created_at?->toIso8601String(),
            'updatedAt' => $t->updated_at?->toIso8601String(),
        ];
    }
}
