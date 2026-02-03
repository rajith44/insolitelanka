<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * List all newsletter subscribers (admin only).
     * GET /api/newsletter
     */
    public function index(): JsonResponse
    {
        $items = NewsletterSubscriber::orderBy('subscribed_at', 'desc')->get();
        return response()->json($items->map(fn ($s) => [
            'id' => (string) $s->id,
            'email' => $s->email,
            'subscribedAt' => $s->subscribed_at?->toIso8601String(),
        ]));
    }

    /**
     * Subscribe an email to the newsletter.
     * POST /api/newsletter
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:255'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Please enter a valid email address.', 'errors' => $validator->errors()], 422);
        }

        $email = $request->input('email');

        NewsletterSubscriber::firstOrCreate(
            ['email' => $email],
            ['subscribed_at' => now()]
        );

        return response()->json(['message' => 'Thank you! You have been subscribed to our newsletter.']);
    }
}
