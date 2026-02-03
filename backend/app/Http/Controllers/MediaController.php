<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * List all media (images and videos) for the admin media library.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::query()->where('is_active', 1);

        $type = $request->query('type');
        if ($type === 'image') {
            $query->where('type', 'like', 'image/%');
        } elseif ($type === 'video') {
            $query->where('type', 'like', 'video/%');
        }

        $perPage = (int) $request->query('per_page', 50);
        $items = $query->orderByDesc('created_at')->paginate($perPage);

        $data = $items->getCollection()->map(fn (Media $m) => $this->formatItem($m));
        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    /**
     * Upload one or more files; returns created media items.
     */
    public function store(Request $request): JsonResponse
    {
        $files = $request->file('files') ?? $request->file('file');
        if (! $files) {
            return response()->json(['message' => 'No files provided'], 422);
        }
        $files = is_array($files) ? $files : [$files];

        $created = [];
        foreach ($files as $file) {
            if (! $file->isValid()) {
                continue;
            }
            $mime = $file->getClientMimeType();
            $mainType = explode('/', $mime)[0] ?? '';
            if ($mainType !== 'image' && $mainType !== 'video') {
                continue;
            }
            $mediaId = $this->fileUploadService->store($file);
            if ($mediaId) {
                $media = Media::find($mediaId);
                if ($media) {
                    $created[] = $this->formatItem($media);
                }
            }
        }

        return response()->json($created, 201);
    }

    private function formatItem(Media $m): array
    {
        return [
            'id' => (int) $m->id,
            'url' => $m->url ?? null,
            'type' => $m->type ?? null,
            'fileName' => $m->file_name ?? null,
            'realName' => $m->real_name ?? null,
            'extension' => $m->extension ?? null,
            'size' => (int) ($m->size ?? 0),
            'createdAt' => $m->created_at?->toIso8601String(),
        ];
    }
}
