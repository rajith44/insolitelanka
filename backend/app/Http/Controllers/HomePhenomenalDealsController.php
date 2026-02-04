<?php

namespace App\Http\Controllers;

use App\Models\HomePhenomenalDeal;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomePhenomenalDealsController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Get the single phenomenal deals section (for public home API and admin form).
     */
    public function show(): JsonResponse
    {
        $row = HomePhenomenalDeal::with([
            'card1Media', 'card2Media', 'card3Media', 'card4Media'
        ])->first();

        if (! $row) {
            $row = HomePhenomenalDeal::create([
                'section_badge' => 'Hurry Up',
                'section_heading' => 'Phenomenal Deals Offered',
            ]);
            $row->load(['card1Media', 'card2Media', 'card3Media', 'card4Media']);
        }

        return response()->json($this->formatRow($row));
    }

    /**
     * Update the phenomenal deals section (admin). Accepts FormData: section_badge, section_heading,
     * and per card: cardN_label, cardN_title, cardN_subtitle, cardN_link_url, cardN_link_text, cardN_offer_badge,
     * cardN_image (file) or cardN_media_id.
     */
    public function update(Request $request): JsonResponse
    {
        $row = HomePhenomenalDeal::first();
        if (! $row) {
            $row = HomePhenomenalDeal::create([
                'section_badge' => '',
                'section_heading' => '',
            ]);
        }

        $data = [
            'section_badge' => $request->input('section_badge', $row->section_badge),
            'section_heading' => $request->input('section_heading', $row->section_heading),
        ];

        foreach (['card1', 'card2', 'card3', 'card4'] as $card) {
            $data["{$card}_label"] = $request->input("{$card}_label", $row->{"{$card}_label"});
            $data["{$card}_title"] = $request->input("{$card}_title", $row->{"{$card}_title"});
            $data["{$card}_subtitle"] = $request->input("{$card}_subtitle", $row->{"{$card}_subtitle"});
            $data["{$card}_link_url"] = $request->input("{$card}_link_url", $row->{"{$card}_link_url"});
            $data["{$card}_link_text"] = $request->input("{$card}_link_text", $row->{"{$card}_link_text"});
            $data["{$card}_offer_badge"] = $request->input("{$card}_offer_badge", $row->{"{$card}_offer_badge"});

            if ($request->hasFile("{$card}_image")) {
                $mediaId = $this->fileUploadService->store($request->file("{$card}_image"));
                if ($mediaId) {
                    $data["{$card}_media_id"] = $mediaId;
                }
            } elseif ($request->filled("{$card}_media_id")) {
                $data["{$card}_media_id"] = (int) $request->input("{$card}_media_id");
            }
        }

        $row->update($data);
        $row->load(['card1Media', 'card2Media', 'card3Media', 'card4Media']);

        return response()->json($this->formatRow($row));
    }

    private function formatRow(HomePhenomenalDeal $row): array
    {
        $out = [
            'id' => (string) $row->id,
            'sectionBadge' => $row->section_badge ?? '',
            'sectionHeading' => $row->section_heading ?? '',
        ];

        foreach (['card1', 'card2', 'card3', 'card4'] as $card) {
            $mediaRel = "{$card}Media";
            $media = $row->$mediaRel;
            $out[$card] = [
                'imageUrl' => $media?->url ?? null,
                'mediaId' => $row->{"{$card}_media_id"},
                'label' => $row->{"{$card}_label"} ?? '',
                'title' => $row->{"{$card}_title"} ?? '',
                'subtitle' => $row->{"{$card}_subtitle"} ?? null,
                'linkUrl' => $row->{"{$card}_link_url"} ?? '',
                'linkText' => $row->{"{$card}_link_text"} ?? null,
                'offerBadge' => $row->{"{$card}_offer_badge"} ?? null,
            ];
        }

        return $out;
    }
}
