<?php

namespace App\Http\Controllers;

use App\Models\TourCategory;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TourCategoryController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    public function index(): JsonResponse
    {
        $categories = TourCategory::with(['media', 'parent'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn (TourCategory $c) => $this->formatCategory($c));

        return response()->json($categories);
    }

    public function show(string $id): JsonResponse
    {
        $category = TourCategory::with(['media', 'parent'])->find($id);
        if (!$category) {
            return response()->json(['message' => 'Tour category not found'], 404);
        }
        return response()->json($this->formatCategory($category));
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'parent_id' => ['nullable', 'exists:tour_categories,id'],
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'short_description' => ['nullable', 'string', 'max:500'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $mediaId = null;
        if ($request->hasFile('image')) {
            $mediaId = $this->fileUploadService->store($request->file('image'));
        } elseif ($request->filled('media_id')) {
            $mediaId = (int) $request->input('media_id');
        }

        $parentId = $request->input('parent_id');
        $category = TourCategory::create([
            'parent_id' => $parentId ? (int) $parentId : null,
            'title' => $request->input('title'),
            'slug' => $request->input('slug', ''),
            'short_description' => $request->input('short_description'),
            'media_id' => $mediaId,
        ]);

        $category->load(['media', 'parent']);
        return response()->json($this->formatCategory($category), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $category = TourCategory::find($id);
        if (!$category) {
            return response()->json(['message' => 'Tour category not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'parent_id' => ['nullable', 'exists:tour_categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'short_description' => ['nullable', 'string', 'max:500'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $parentId = $request->input('parent_id');
        $data = [
            'parent_id' => $parentId !== null && $parentId !== '' ? (int) $parentId : null,
            'title' => $request->input('title', $category->title),
            'slug' => $request->input('slug', $category->slug),
            'short_description' => $request->input('short_description', $category->short_description),
        ];

        if ($request->hasFile('image')) {
            $data['media_id'] = $this->fileUploadService->store($request->file('image'));
        } elseif ($request->filled('media_id')) {
            $data['media_id'] = (int) $request->input('media_id');
        }

        $category->update($data);
        $category->load(['media', 'parent']);
        return response()->json($this->formatCategory($category));
    }

    public function destroy(string $id): JsonResponse
    {
        $category = TourCategory::find($id);
        if (!$category) {
            return response()->json(['message' => 'Tour category not found'], 404);
        }
        $category->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function formatCategory(TourCategory $c): array
    {
        $imageUrl = $c->media?->url ?? null;

        return [
            'id' => (string) $c->id,
            'parentId' => $c->parent_id ? (string) $c->parent_id : null,
            'parentTitle' => $c->parent?->title,
            'title' => $c->title,
            'slug' => $c->slug ?? '',
            'shortDescription' => $c->short_description,
            'imageUrl' => $imageUrl,
            'media_id' => $c->media_id,
            'createdAt' => $c->created_at?->toIso8601String(),
            'updatedAt' => $c->updated_at?->toIso8601String(),
        ];
    }
}
