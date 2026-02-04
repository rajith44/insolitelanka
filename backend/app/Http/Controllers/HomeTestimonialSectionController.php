<?php

namespace App\Http\Controllers;

use App\Models\HomeTestimonialSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeTestimonialSectionController extends Controller
{
    public function show(): JsonResponse
    {
        $row = HomeTestimonialSection::first();

        if (! $row) {
            $row = HomeTestimonialSection::create([
                'section_badge' => 'Testimonial',
                'section_heading' => 'Regards From Travelers',
            ]);
        }

        return response()->json([
            'id' => (string) $row->id,
            'sectionBadge' => $row->section_badge ?? '',
            'sectionHeading' => $row->section_heading ?? '',
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $row = HomeTestimonialSection::first();
        if (! $row) {
            $row = HomeTestimonialSection::create([
                'section_badge' => $request->input('section_badge', ''),
                'section_heading' => $request->input('section_heading', ''),
            ]);
        } else {
            $row->update([
                'section_badge' => $request->input('section_badge', $row->section_badge),
                'section_heading' => $request->input('section_heading', $row->section_heading),
            ]);
        }

        return response()->json([
            'id' => (string) $row->id,
            'sectionBadge' => $row->section_badge ?? '',
            'sectionHeading' => $row->section_heading ?? '',
        ]);
    }
}
