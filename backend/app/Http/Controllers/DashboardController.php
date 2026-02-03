<?php

namespace App\Http\Controllers;

use App\Models\ContactFormSubmission;
use App\Models\Destination;
use App\Models\HomePageSlider;
use App\Models\Hotel;
use App\Models\NewsletterSubscriber;
use App\Models\SiteGallery;
use App\Models\Tour;
use App\Models\TourCategory;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Dashboard stats for admin (auth required).
     * GET /api/dashboard
     */
    public function index(): JsonResponse
    {
        $stats = [
            'tours' => Tour::count(),
            'tourCategories' => TourCategory::count(),
            'destinations' => Destination::count(),
            'hotels' => Hotel::count(),
            'contactSubmissions' => ContactFormSubmission::count(),
            'newsletterSubscribers' => NewsletterSubscriber::count(),
            'galleryPhotos' => SiteGallery::count(),
            'homePageSliders' => HomePageSlider::count(),
        ];

        $recentContactSubmissions = ContactFormSubmission::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'id' => (string) $s->id,
                'name' => $s->name,
                'email' => $s->email,
                'message' => \Illuminate\Support\Str::limit($s->message, 80),
                'createdAt' => $s->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'stats' => $stats,
            'recentContactSubmissions' => $recentContactSubmissions,
        ]);
    }
}
