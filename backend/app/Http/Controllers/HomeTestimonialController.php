<?php

namespace App\Http\Controllers;

use App\Models\HomeTestimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeTestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        $items = HomeTestimonial::orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HomeTestimonial $t) => $this->formatItem($t));

        return response()->json($items);
    }

    public function show(string $id): JsonResponse
    {
        $item = HomeTestimonial::find($id);
        if (! $item) {
            return response()->json(['message' => 'Testimonial not found'], 404);
        }
        return response()->json($this->formatItem($item));
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'person_name' => ['nullable', 'string', 'max:200'],
            'country' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'string', 'max:50'],
            'person_comment' => ['nullable', 'string'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $maxOrder = (int) HomeTestimonial::max('sort_order');

        $item = HomeTestimonial::create([
            'person_name' => $request->input('person_name'),
            'country' => $request->input('country'),
            'date' => $request->input('date'),
            'person_comment' => $request->input('person_comment'),
            'rating' => (int) ($request->input('rating') ?? 5),
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json($this->formatItem($item), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $item = HomeTestimonial::find($id);
        if (! $item) {
            return response()->json(['message' => 'Testimonial not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'person_name' => ['nullable', 'string', 'max:200'],
            'country' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'string', 'max:50'],
            'person_comment' => ['nullable', 'string'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $item->update([
            'person_name' => $request->input('person_name', $item->person_name),
            'country' => $request->input('country', $item->country),
            'date' => $request->input('date', $item->date),
            'person_comment' => $request->input('person_comment', $item->person_comment),
            'rating' => (int) ($request->input('rating') ?? $item->rating),
        ]);

        return response()->json($this->formatItem($item));
    }

    public function destroy(string $id): JsonResponse
    {
        $item = HomeTestimonial::find($id);
        if (! $item) {
            return response()->json(['message' => 'Testimonial not found'], 404);
        }
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function formatItem(HomeTestimonial $t): array
    {
        $rating = max(1, min(5, (int) $t->rating));
        return [
            'id' => (string) $t->id,
            'personName' => $t->person_name ?? '',
            'country' => $t->country ?? '',
            'date' => $t->date ?? '',
            'personComment' => $t->person_comment ?? '',
            'personRating' => array_values(range(1, $rating)),
            'sortOrder' => (int) $t->sort_order,
        ];
    }
}
