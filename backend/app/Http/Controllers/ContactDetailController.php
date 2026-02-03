<?php

namespace App\Http\Controllers;

use App\Models\ContactDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactDetailController extends Controller
{
    /**
     * Get contact details (single row, id=1).
     */
    public function show(): JsonResponse
    {
        $contact = ContactDetail::first();
        if (!$contact) {
            $contact = ContactDetail::create([
                'email' => '',
                'phone' => '',
                'address' => '',
                'map_embed' => '',
                'facebook_url' => '',
                'twitter_url' => '',
                'instagram_url' => '',
                'linkedin_url' => '',
            ]);
        }
        return response()->json($this->formatContact($contact));
    }

    /**
     * Update contact details.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'map_embed' => ['nullable', 'string'],
            'facebook_url' => ['nullable', 'string', 'max:500'],
            'twitter_url' => ['nullable', 'string', 'max:500'],
            'instagram_url' => ['nullable', 'string', 'max:500'],
            'linkedin_url' => ['nullable', 'string', 'max:500'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $contact = ContactDetail::first();
        if (!$contact) {
            $contact = ContactDetail::create([
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'map_embed' => $request->input('map_embed'),
                'facebook_url' => $request->input('facebook_url'),
                'twitter_url' => $request->input('twitter_url'),
                'instagram_url' => $request->input('instagram_url'),
                'linkedin_url' => $request->input('linkedin_url'),
            ]);
        } else {
            $contact->update([
                'email' => $request->input('email', $contact->email),
                'phone' => $request->input('phone', $contact->phone),
                'address' => $request->input('address', $contact->address),
                'map_embed' => $request->input('map_embed', $contact->map_embed),
                'facebook_url' => $request->input('facebook_url', $contact->facebook_url),
                'twitter_url' => $request->input('twitter_url', $contact->twitter_url),
                'instagram_url' => $request->input('instagram_url', $contact->instagram_url),
                'linkedin_url' => $request->input('linkedin_url', $contact->linkedin_url),
            ]);
        }
        return response()->json($this->formatContact($contact));
    }

    private function formatContact(ContactDetail $c): array
    {
        return [
            'id' => (string) $c->id,
            'email' => $c->email ?? '',
            'phone' => $c->phone ?? '',
            'address' => $c->address ?? '',
            'mapEmbed' => $c->map_embed ?? '',
            'facebookUrl' => $c->facebook_url ?? '',
            'twitterUrl' => $c->twitter_url ?? '',
            'instagramUrl' => $c->instagram_url ?? '',
            'linkedinUrl' => $c->linkedin_url ?? '',
            'updatedAt' => $c->updated_at?->toIso8601String(),
        ];
    }
}
