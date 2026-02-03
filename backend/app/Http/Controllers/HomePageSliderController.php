<?php

namespace App\Http\Controllers;

use App\Models\HomePageSlider;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomePageSliderController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function index(): JsonResponse
    {
        $sliders = HomePageSlider::with('media')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HomePageSlider $s) => $this->formatSlider($s));

        return response()->json($sliders);
    }

    public function show(string $id): JsonResponse
    {
        $slider = HomePageSlider::with('media')->find($id);
        if (!$slider) {
            return response()->json(['message' => 'Slider not found'], 404);
        }
        return response()->json($this->formatSlider($slider));
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'topname' => ['nullable', 'string', 'max:200'],
            'title' => ['nullable', 'string', 'max:200'],
            'subtitle' => ['nullable', 'string', 'max:500'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $mediaId = null;
        if ($request->hasFile('image')) {
            $mediaId = $this->fileUploadService->store($request->file('image'));
        }

        $maxOrder = HomePageSlider::max('sort_order') ?? 0;

        $slider = HomePageSlider::create([
            'media_id' => $mediaId,
            'topname' => $request->input('topname'),
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'sort_order' => $maxOrder + 1,
        ]);

        $slider->load('media');
        return response()->json($this->formatSlider($slider), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $slider = HomePageSlider::find($id);
        if (!$slider) {
            return response()->json(['message' => 'Slider not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'topname' => ['nullable', 'string', 'max:200'],
            'title' => ['nullable', 'string', 'max:200'],
            'subtitle' => ['nullable', 'string', 'max:500'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = [
            'topname' => $request->input('topname', $slider->topname),
            'title' => $request->input('title', $slider->title),
            'subtitle' => $request->input('subtitle', $slider->subtitle),
        ];

        if ($request->hasFile('image')) {
            $data['media_id'] = $this->fileUploadService->store($request->file('image'));
        }

        $slider->update($data);
        $slider->load('media');
        return response()->json($this->formatSlider($slider));
    }

    public function destroy(string $id): JsonResponse
    {
        $slider = HomePageSlider::find($id);
        if (!$slider) {
            return response()->json(['message' => 'Slider not found'], 404);
        }
        $slider->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function formatSlider(HomePageSlider $s): array
    {
        return [
            'id' => (string) $s->id,
            'imageUrl' => $s->media?->url ?? null,
            'media_id' => $s->media_id,
            'topname' => $s->topname ?? '',
            'title' => $s->title ?? '',
            'subtitle' => $s->subtitle ?? '',
            'sortOrder' => (int) $s->sort_order,
            'createdAt' => $s->created_at?->toIso8601String(),
            'updatedAt' => $s->updated_at?->toIso8601String(),
        ];
    }
}
