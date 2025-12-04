<?php

namespace TmrEcosystem\Inventory\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;
// --- Domain & Application Layers ---
use TmrEcosystem\Inventory\Application\DTOs\ItemData;
use TmrEcosystem\Inventory\Application\UseCases\ManageItems\CreateItemUseCase;
use TmrEcosystem\Inventory\Application\UseCases\ManageItems\UpdateItemUseCase;
use TmrEcosystem\Inventory\Application\UseCases\ManageItems\DeleteItemUseCase;
use TmrEcosystem\Inventory\Domain\Exceptions\PartNumberAlreadyExistsException;
use TmrEcosystem\Inventory\Domain\Repositories\ItemRepositoryInterface;

// --- Infrastructure Models ---
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\InventoryCategory;
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\InventoryUom;
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\ItemModel;

// --- Requests ---
use TmrEcosystem\Inventory\Presentation\Http\Requests\CreateItemRequest;
use TmrEcosystem\Inventory\Presentation\Http\Requests\UpdateItemRequest;

// ✅ 1. Import Service Interface เพื่อดึงข้อมูลข้าม Context
use TmrEcosystem\Stock\Application\Contracts\StockCheckServiceInterface;

class ItemController extends Controller
{
    public function __construct(
        protected ItemRepositoryInterface $itemRepository,
        protected ItemLookupServiceInterface $itemLookupService, // ✅ Inject
        protected StockCheckServiceInterface $stockCheckService   // ✅ Inject
    ) {}

    /**
     * (READ) แสดงหน้า List ของ Items
     */
    public function index(Request $request): Response
    {
        $companyId = Auth::user()->company_id;

        // 1. รับค่า Filters ทั้งหมด
        $filters = $request->only(['search', 'category', 'sort', 'direction']);

        // 2. ดึง List Categories สำหรับ Dropdown Filter
        $categories = InventoryCategory::where('company_id', $companyId)
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        // 3. เรียก Repository
        $items = $this->itemRepository->getPaginatedList($companyId, $filters);

        return Inertia::render('Inventory/Items/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters' => (object) $filters, // Cast เป็น object เพื่อป้องกัน Array ว่างใน JS
        ]);
    }

    /**
     * (CREATE - Step 1) แสดงหน้าฟอร์มสร้างสินค้า
     */
    public function create(): Response
    {
        $companyId = Auth::user()->company_id;

        return Inertia::render('Inventory/Items/Create', [
            'item' => null,
            'categories' => InventoryCategory::where('company_id', $companyId)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'uoms' => InventoryUom::where('company_id', $companyId)
                ->orderBy('name')
                ->get(['id', 'name', 'symbol']),
        ]);
    }

    /**
     * (CREATE - Step 2) บันทึกสินค้าใหม่
     */
    public function store(
        CreateItemRequest $request,
        CreateItemUseCase $createItem
    ): RedirectResponse {

        $validatedData = $request->validated();
        $companyId = Auth::user()->company_id;

        try {
            $itemData = new ItemData(
                companyId: $companyId,
                partNumber: $validatedData['part_number'],
                name: $validatedData['name'],
                uomId: $validatedData['uom_id'],
                averageCost: (float) $validatedData['average_cost'],
                categoryId: $validatedData['category_id'],
                description: $validatedData['description'] ?? null,
                // ✅ รับไฟล์รูปภาพ
                images: $request->allFiles()['images'] ?? []
            );

            $newItem = $createItem($itemData);

            return redirect()->route('inventory.items.index')
                ->with('success', "Item '{$newItem->name()}' created successfully.");
        } catch (PartNumberAlreadyExistsException $e) {
            return back()->withInput()->withErrors([
                'part_number' => $e->getMessage()
            ]);
        } catch (Exception $e) {
            Log::error('Failed to create item: ' . $e->getMessage());
            return back()->withInput()->with('error', 'An unexpected error occurred: ' . $e->getMessage());
        }
    }

    /**
     * (READ - Detail) แสดงหน้ารายละเอียดสินค้า
     */
    public function show(string $uuid): Response
    {
        $companyId = Auth::user()->company_id;

        // 1. ดึงข้อมูล Item ปัจจุบัน พร้อมรูปภาพ
        $item = ItemModel::with(['category', 'uom', 'images'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        // 2. Logic คำนวณ Previous / Next (Pager)
        $allItems = ItemModel::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->pluck('uuid')
            ->toArray();

        $currentIndex = array_search($uuid, $allItems);
        $totalItems = count($allItems);

        $prevUuid = ($currentIndex > 0) ? $allItems[$currentIndex - 1] : null;
        $nextUuid = ($currentIndex < $totalItems - 1) ? $allItems[$currentIndex + 1] : null;

        // 3. เตรียมข้อมูลรูปภาพ (เรียง Primary ขึ้นก่อน)
        $images = $item->images
            ->sortBy([['is_primary', 'desc'], ['sort_order', 'asc']])
            ->map(function ($img) {
                return asset('storage/' . $img->path);
            })
            ->values()
            ->toArray();

        // 4. ✅ เรียก Stock Service เพื่อดึงยอดจริง
        // ใช้ Service Interface ข้าม Context อย่างถูกต้อง
        $stockData = $this->stockCheckService->getStockSummary($uuid, $companyId);

        return Inertia::render('Inventory/Items/Show', [
            'item' => [
                'uuid' => $item->uuid,
                'part_number' => $item->part_number,
                'name' => $item->name,
                'description' => $item->description,
                'average_cost' => $item->average_cost,
                'category_name' => $item->category?->name ?? 'Uncategorized',
                'uom_name' => $item->uom?->name . ' (' . $item->uom?->symbol . ')',
                'images' => $images,
                'created_at' => $item->created_at->format('d/m/Y H:i'),
                // ✅ ส่งข้อมูลจริงไปที่ View
                'stock' => $stockData
            ],
            'paginationInfo' => [
                'current_index' => $currentIndex + 1,
                'total' => $totalItems,
                'prev_uuid' => $prevUuid,
                'next_uuid' => $nextUuid,
            ]
        ]);
    }

    /**
     * (UPDATE - Step 1) แสดงหน้าฟอร์มแก้ไข
     */
    public function edit(string $uuid): Response
    {
        $companyId = Auth::user()->company_id;

        // ใช้ Model เพื่อความสะดวกในการดึง Relations สำหรับ View
        $item = ItemModel::with('images')->where('uuid', $uuid)->firstOrFail();

        $categories = InventoryCategory::where('company_id', $companyId)->orderBy('name')->get(['id', 'name', 'code']);
        $uoms = InventoryUom::where('company_id', $companyId)->orderBy('name')->get(['id', 'name', 'symbol']);

        // เตรียมข้อมูลรูปภาพเดิมส่งไปให้ Frontend
        $existingImages = $item->images->map(function ($img) {
            return [
                'id' => $img->id,
                'url' => asset('storage/' . $img->path),
                'is_primary' => $img->is_primary
            ];
        });

        return Inertia::render('Inventory/Items/Edit', [
            'item' => [
                'uuid' => $item->uuid,
                'part_number' => $item->part_number,
                'name' => $item->name,
                'average_cost' => $item->average_cost,
                'description' => $item->description,
                'uom_id' => $item->uom_id,
                'category_id' => $item->category_id,
                'existing_images' => $existingImages
            ],
            'categories' => $categories,
            'uoms' => $uoms,
        ]);
    }

    /**
     * (UPDATE - Step 2) บันทึกการแก้ไข
     */
    public function update(
        string $uuid,
        UpdateItemRequest $request,
        UpdateItemUseCase $updateItem
    ): RedirectResponse {

        $validatedData = $request->validated();
        $companyId = Auth::user()->company_id;

        try {
            $itemData = new ItemData(
                companyId: $companyId,
                partNumber: $validatedData['part_number'],
                name: $validatedData['name'],
                uomId: $validatedData['uom_id'],
                averageCost: (float) $validatedData['average_cost'],
                categoryId: $validatedData['category_id'],
                description: $validatedData['description'] ?? null,
                // ✅ รับไฟล์รูปใหม่
                images: $request->allFiles()['new_images'] ?? []
            );

            // รับ ID ของรูปที่จะลบ
            $removedImageIds = $request->input('removed_image_ids', []);

            // ✅ รับ ID ของรูปหลัก (Set Primary)
            $setPrimaryImageId = $request->input('set_primary_image_id');

            // เรียก Use Case (ส่ง 4 arguments)
            $updatedItem = $updateItem($uuid, $itemData, $removedImageIds, $setPrimaryImageId);

            return redirect()->route('inventory.items.index')
                ->with('success', "Item '{$updatedItem->name()}' updated successfully.");
        } catch (PartNumberAlreadyExistsException $e) {
            return back()->withInput()->withErrors(['part_number' => $e->getMessage()]);
        } catch (Exception $e) {
            Log::error("Failed to update item {$uuid}: " . $e->getMessage());
            return back()->withInput()->with('error', 'An unexpected error occurred: ' . $e->getMessage());
        }
    }

    /**
     * (DELETE) ลบ Item
     */
    public function destroy(string $uuid, DeleteItemUseCase $deleteItem): RedirectResponse
    {
        try {
            $deleteItem($uuid);
            return redirect()->route('inventory.items.index')
                ->with('success', "Item deleted successfully.");
        } catch (Exception $e) {
            Log::error("Failed to delete item {$uuid}: " . $e->getMessage());
            return back()->with('error', 'An unexpected error occurred.');
        }
    }

    /**
     * (API) สำหรับเรียกดูข้อมูล JSON (ใช้โดย Sales/Logistics หากไม่ได้ผ่าน Service)
     */
    public function apiShow(string $id)
    {
        $item = ItemModel::with(['category', 'uom', 'images'])
            ->where('uuid', $id)
            ->orWhere('part_number', $id)
            ->firstOrFail();

        $primaryImage = $item->images->where('is_primary', true)->first() ?? $item->images->first();

        // ✅ ดึง Stock จริงด้วย (เพื่อให้ API คืนค่าจริง)
        $stockSummary = $this->stockCheckService->getStockSummary($item->uuid, $item->company_id);

        return response()->json([
            'id' => $item->uuid,
            'part_number' => $item->part_number,
            'name' => $item->name,
            'description' => $item->description,
            'image_url' => $primaryImage ? asset('storage/' . $primaryImage->path) : null,
            'stock_on_hand' => $stockSummary['on_hand'], // ✅ ใช้ค่าจริง
            'price' => $item->average_cost,
            'category_name' => $item->category?->name,
            'uom_name' => $item->uom?->name,
            'uom_symbol' => $item->uom?->symbol,
        ]);
    }

    /**
     * ✅ [New API] ค้นหาสินค้าสำหรับ Dropdown (Async)
     */
    public function search(Request $request)
    {
        $search = $request->input('q', '');

        // 1. ค้นหาจาก DB (ผ่าน Service ที่มี Limit 50)
        $items = $this->itemLookupService->searchItems($search);

        // 2. Map ข้อมูลให้ตรงกับ format ที่ ProductCombobox ต้องการ
        $results = collect($items)->map(function ($item) use ($request) {

            // (Optional) ดึงยอดสต็อกจริงมาด้วย
            // การดึงทีละ loop อาจช้า ถ้าจะให้ดีควรมี checkAvailabilityBatch
            // แต่เพื่อความง่ายในเฟสนี้ ดึงรายตัวไปก่อน หรือใส่ 0 ไว้ถ้าเน้นเร็ว
            $stockSummary = $this->stockCheckService->getStockSummary($item->uuid, Auth::user()->company_id);

            return [
                'id' => $item->partNumber, // ใช้ PartNumber เป็น Value
                'name' => $item->name,
                'code' => $item->partNumber,
                'price' => $item->price,
                'stock' => $stockSummary['on_hand'] ?? 0, // ยอดคงเหลือจริง
                'image_url' => $item->imageUrl,
            ];
        });

        return response()->json($results);
    }
}
