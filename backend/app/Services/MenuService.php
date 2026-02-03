<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\TourCategory;
use Illuminate\Support\Str;

class MenuService
{
    
    /**
     * Tour menu: categories with their subcategories (no featured tours).
     *
     * @return array<int, array{tourCategoryName: string, tourCategoryId: string, slug: string, subcategories: array}>
     */
    public function getTourMenu(): array
    {
        $categories = TourCategory::with(['children' => fn ($q) => $q->orderBy('title')])
            ->whereNull('parent_id')
            ->orderBy('title')
            ->get();

        $menu = [];
        foreach ($categories as $category) {
            $menu[] = [
                'tourCategoryName' => $category->title,
                'tourCategoryId' => (string) $category->id,
                'slug' => $category->slug ?? Str::slug($category->title),
                'subcategories' => $category->children->map(fn (TourCategory $child) => [
                    'subcategoryId' => (string) $child->id,
                    'subcategoryName' => $child->title,
                    'slug' => $child->slug ?? Str::slug($child->title),
                ])->values()->all(),
            ];
        }

        return $menu;
    }

    /**
     * Destination menu: countries with their places.
     *
     * @return array<int, array{country: string, slug: string, places: array<int, array{name: string, slug: string}>}>
     */
    public function getDestinationMenu(): array
    {
        $destinations = Destination::orderBy('title')->get();

        $byCountry = [];
        foreach ($destinations as $d) {
            $cid = (string) $d->country_id;
            if (!isset($byCountry[$cid])) {
                $byCountry[$cid] = [];
            }
            $byCountry[$cid][] = $d;
        }

        $menu = [];
        foreach ($byCountry as $countryId => $places) {
            $countryName = Str::title(str_replace(['-', '_'], ' ', $countryId));
            $slug = Str::slug($countryId);

            $menu[] = [
                'country' => $countryName,
                'slug' => $slug,
                'places' => array_map(function (Destination $d) {
                    return [
                        'name' => $d->title,
                        'slug' => $d->slug
                    ];
                }, $places),
            ];
        }

        return $menu;
    }
}
