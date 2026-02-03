<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactDetailController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\HomePageSliderController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\TourCategoryController;
use App\Http\Controllers\TourController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Combined nav menu (tours + destinations in one call)
Route::get('/menu', [MenuController::class, 'index']);

// Home page: sliders + tours + hotels + destinations in one call (avoids 429 on load)
Route::get('/home', [HomeController::class, 'index']);

// Destinations API (optionally protect with auth:api)
Route::get('/destinations/menu', [DestinationController::class, 'menu']);
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/slug/{slug}', [DestinationController::class, 'showBySlug']);
Route::get('/destinations/{id}', [DestinationController::class, 'show']);
Route::post('/destinations', [DestinationController::class, 'store']);
Route::put('/destinations/{id}', [DestinationController::class, 'update']);
Route::post('/destinations/{id}', [DestinationController::class, 'update']); // POST for FormData (PHP doesn't parse PUT body)
Route::delete('/destinations/{id}', [DestinationController::class, 'destroy']);

// Hotels API
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);
Route::post('/hotels', [HotelController::class, 'store']);
Route::put('/hotels/{id}', [HotelController::class, 'update']);
Route::post('/hotels/{id}', [HotelController::class, 'update']); // POST for FormData
Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);

// Tour Categories API
Route::get('/tour-categories', [TourCategoryController::class, 'index']);
Route::get('/tour-categories/{id}', [TourCategoryController::class, 'show']);
Route::post('/tour-categories', [TourCategoryController::class, 'store']);
Route::put('/tour-categories/{id}', [TourCategoryController::class, 'update']);
Route::post('/tour-categories/{id}', [TourCategoryController::class, 'update']); // POST for FormData
Route::delete('/tour-categories/{id}', [TourCategoryController::class, 'destroy']);

// Tours API
Route::get('/tours/menu', [TourController::class, 'menu']);
Route::get('/tours', [TourController::class, 'index']);
Route::get('/tours/slug/{slug}', [TourController::class, 'showBySlug']);
Route::get('/tours/{id}', [TourController::class, 'show']);
Route::post('/tours', [TourController::class, 'store']);
Route::put('/tours/{id}', [TourController::class, 'update']);
Route::post('/tours/{id}', [TourController::class, 'update']); // POST for FormData
Route::delete('/tours/{id}', [TourController::class, 'destroy']);

// Settings: Home page slider
Route::get('/home-page-sliders', [HomePageSliderController::class, 'index']);
Route::get('/home-page-sliders/{id}', [HomePageSliderController::class, 'show']);
Route::post('/home-page-sliders', [HomePageSliderController::class, 'store']);
Route::put('/home-page-sliders/{id}', [HomePageSliderController::class, 'update']);
Route::post('/home-page-sliders/{id}', [HomePageSliderController::class, 'update']); // POST for FormData
Route::delete('/home-page-sliders/{id}', [HomePageSliderController::class, 'destroy']);

// Settings: Site gallery (upload photos for public gallery page)
Route::get('/gallery', [GalleryController::class, 'index']);
Route::post('/gallery', [GalleryController::class, 'store']);
Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);

// Contact form (public): submit and send email to admin + customer (rate limit: 5 per minute per IP)
Route::post('/contact-form', [ContactFormController::class, 'store'])->middleware('throttle:5,1');

// Newsletter subscription (public, rate limit: 10 per minute per IP)
Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:10,1');

// Settings: Contact details (single resource)
Route::get('/contact-details', [ContactDetailController::class, 'show']);
Route::put('/contact-details', [ContactDetailController::class, 'update']);
Route::post('/contact-details', [ContactDetailController::class, 'update']);

// Protected auth routes (require valid JWT)
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    // Admin dashboard stats
    Route::get('/dashboard', [DashboardController::class, 'index']);
    // Admin: view contact form submissions and newsletter subscribers
    Route::get('/contact-submissions', [ContactFormController::class, 'index']);
    Route::get('/newsletter', [NewsletterController::class, 'index']);
});
