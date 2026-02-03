<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormAdminMail;
use App\Mail\ContactFormCustomerMail;
use App\Models\ContactDetail;
use App\Models\ContactFormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactFormController extends Controller
{
    /**
     * List all contact form submissions (admin only).
     * GET /api/contact-submissions
     */
    public function index(): JsonResponse
    {
        $items = ContactFormSubmission::orderBy('created_at', 'desc')->get();
        return response()->json($items->map(fn ($s) => [
            'id' => (string) $s->id,
            'name' => $s->name,
            'email' => $s->email,
            'phone' => $s->phone ?? '',
            'message' => $s->message,
            'createdAt' => $s->created_at?->toIso8601String(),
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        // Honeypot: bots often fill hidden fields; humans leave them empty
        if ($request->filled('website_url')) {
            return response()->json(['message' => 'Invalid submission.'], 422);
        }

        // Optional reCAPTCHA v2: verify if secret is configured
        $secret = config('services.recaptcha.secret_key');
        if (! empty($secret)) {
            $token = $request->input('recaptcha_token');
            if (empty($token) || ! $this->verifyRecaptcha($token, $request->ip(), $secret)) {
                return response()->json(['message' => 'Please complete the security check and try again.'], 422);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['required', 'string', 'max:5000'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $submission = ContactFormSubmission::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'message' => $request->input('message'),
        ]);

        $adminEmail = ContactDetail::first()?->email;
        if (empty($adminEmail)) {
            $adminEmail = config('mail.from.address');
        }

        try {
            if (! empty($adminEmail)) {
                Mail::to($adminEmail)->send(new ContactFormAdminMail($submission));
            }
            Mail::to($submission->email)->send(new ContactFormCustomerMail($submission));
        } catch (\Throwable $e) {
            Log::warning('Contact form mail send failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Thank you for your message. We will get back to you soon.',
            'id' => (string) $submission->id,
        ], 201);
    }

    private function verifyRecaptcha(string $token, ?string $remoteIp, string $secret): bool
    {
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $remoteIp,
        ]);
        $body = $response->json();
        return ! empty($body['success']) && $body['success'] === true;
    }
}
