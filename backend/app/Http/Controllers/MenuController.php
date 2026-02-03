<?php

namespace App\Http\Controllers;

use App\Services\MenuService;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function __construct(
        private MenuService $menuService
    ) {}

    /**
     * Combined nav menu: tours and destinations in one response.
     * GET /api/menu
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'tours' => $this->menuService->getTourMenu(),
            'destinations' => $this->menuService->getDestinationMenu(),
        ]);
    }
}
