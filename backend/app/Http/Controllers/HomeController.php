<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Single endpoint for home page data (sliders, tours, hotels, destinations)
 * to avoid multiple API calls and 429 Too Many Requests on load.
 */
class HomeController extends Controller
{
    private const TOURS_LIMIT = 30; // enough for bundles (one per category)
    private const HOTELS_LIMIT = 6;
    private const DESTINATIONS_LIMIT = 6;

    public function index(Request $request): JsonResponse
    {
        $slidersResp = app(HomePageSliderController::class)->index();
        $phenomenalResp = app(HomePhenomenalDealsController::class)->show();
        $testimonialSectionResp = app(HomeTestimonialSectionController::class)->show();
        $testimonialsResp = app(HomeTestimonialController::class)->index();
        $toursResp = app(TourController::class)->index($request);
        $hotelsResp = app(HotelController::class)->index();
        $destinationsResp = app(DestinationController::class)->index();

        $sliders = json_decode($slidersResp->getContent(), true) ?? [];
        $phenomenalDeals = json_decode($phenomenalResp->getContent(), true);
        $testimonialSection = json_decode($testimonialSectionResp->getContent(), true);
        $testimonials = json_decode($testimonialsResp->getContent(), true) ?? [];
        $tours = array_slice(json_decode($toursResp->getContent(), true) ?? [], 0, self::TOURS_LIMIT);
        $hotels = array_slice(json_decode($hotelsResp->getContent(), true) ?? [], 0, self::HOTELS_LIMIT);
        $destinations = array_slice(json_decode($destinationsResp->getContent(), true) ?? [], 0, self::DESTINATIONS_LIMIT);

        return response()->json([
            'sliders' => $sliders,
            'phenomenalDeals' => $phenomenalDeals,
            'testimonialSection' => $testimonialSection,
            'testimonials' => $testimonials,
            'tours' => $tours,
            'hotels' => $hotels,
            'destinations' => $destinations,
        ]);
    }
}
