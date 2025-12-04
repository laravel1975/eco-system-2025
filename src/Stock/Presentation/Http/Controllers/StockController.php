<?php

namespace TmrEcosystem\Stock\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Log;
// Domain & Application
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Stock\Application\UseCases\ReceiveStockUseCase;
use TmrEcosystem\Stock\Application\DTOs\ReceiveStockData;

// Shared Services
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;
use TmrEcosystem\Stock\Application\DTOs\AdjustStockData;
use TmrEcosystem\Stock\Application\DTOs\TransferStockData;
use TmrEcosystem\Stock\Application\UseCases\AdjustStockUseCase;
use TmrEcosystem\Stock\Application\UseCases\TransferStockUseCase;
// Infrastructure Models (Cross-Boundary Query)
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\StorageLocationModel;

class StockController extends Controller
{
    public function __construct(
        protected StockLevelRepositoryInterface $stockRepository,
        protected ItemLookupServiceInterface $itemLookupService
    ) {}

    public function index(Request $request): Response
    {
        // ... (โค้ด index เดิมของคุณ คงไว้เหมือนเดิม) ...
        $companyId = $request->user()->company_id;
        $filters = $request->only(['search', 'warehouse_uuid']);
        $stockLevels = $this->stockRepository->getPaginatedList($companyId, $filters);
        $warehouses = WarehouseModel::where('company_id', $companyId)->where('is_active', true)->get(['uuid', 'name', 'code']);

        return Inertia::render('Stock/Index', [
            'stockLevels' => $stockLevels,
            'warehouses' => $warehouses,
            'filters' => $filters,
        ]);
    }

    /**
     * ✅ [เพิ่มใหม่] แสดงหน้าฟอร์มรับสินค้า
     */
    public function receive(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        $warehouses = WarehouseModel::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['uuid', 'name', 'code']);

        $selectedWarehouseId = $request->input('warehouse_uuid') ?? ($warehouses->first()->uuid ?? null);
        $locations = [];

        if ($selectedWarehouseId) {
            $locations = StorageLocationModel::where('warehouse_uuid', $selectedWarehouseId)
                ->where('is_active', true)
                ->orderBy('code')
                ->get(['uuid', 'code', 'type', 'description']);
        }

        // ✅ FIX: Map ข้อมูลสินค้าให้ตรงกับ Format ที่ Frontend (Combobox) ต้องการ
        // เราจะใช้ PartNumber เป็น 'id' เพื่อให้ตอน Submit กลับมา ได้ค่า PartNumber เลย
        // ✅ FIX: Map ข้อมูลสินค้าให้มี field 'stock' ตามที่ ProductCombobox ต้องการ
        $rawProducts = $this->itemLookupService->searchItems('');
        $products = collect($rawProducts)->map(fn($item) => [
            'id' => $item->partNumber,
            'name' => "{$item->name} ({$item->partNumber})",
            'price' => $item->price,
            'stock' => 0, // 👈 เพิ่มบรรทัดนี้ (ใส่ 0 ไปก่อนเพราะหน้า Receive ไม่ได้ซีเรียสเรื่องยอดคงเหลือเท่าหน้า Sales)
            'image_url' => $item->imageUrl
        ])->values();

        return Inertia::render('Stock/Receive', [
            'warehouses' => $warehouses,
            'locations' => $locations,
            'products' => $products,
            'selectedWarehouseUuid' => $selectedWarehouseId
        ]);
    }

    public function processReceive(Request $request, ReceiveStockUseCase $receiveUseCase)
    {
        // Debug: ดูค่าที่ส่งมา
        // Log::info('Receive Payload:', $request->all());

        $request->validate([
            'warehouse_uuid' => 'required|exists:warehouses,uuid',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required', // ตอนนี้ Frontend จะส่ง PartNumber มาที่นี่
            'items.*.location_uuid' => 'required|exists:warehouse_storage_locations,uuid',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string'
        ]);

        $companyId = $request->user()->company_id;
        $warehouseUuid = $request->warehouse_uuid;
        $reference = $request->reference ?? 'Manual Receive';

        try {
            DB::transaction(function () use ($request, $receiveUseCase, $companyId, $warehouseUuid, $reference) {

                foreach ($request->items as $item) {
                    // 1. ค้นหาด้วย Part Number (ซึ่งตอนนี้ค่า product_id คือ PartNumber แล้ว)
                    $productDto = $this->itemLookupService->findByPartNumber($item['product_id']);

                    if (!$productDto) {
                        throw new Exception("Product not found or inactive: " . $item['product_id']);
                    }

                    $data = new ReceiveStockData(
                        companyId: $companyId,
                        itemUuid: $productDto->uuid,
                        warehouseUuid: $warehouseUuid,
                        locationUuid: $item['location_uuid'],
                        quantity: (float) $item['quantity'],
                        userId: auth()->id(),
                        reference: $reference
                    );

                    $receiveUseCase($data);
                }
            });

            return to_route('stock.index')->with('success', 'Received stock successfully.');
        } catch (Exception $e) {
            Log::error('Receive Stock Failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to receive stock: ' . $e->getMessage());
        }
    }

    /**
     * ✅ [เพิ่มใหม่] ดำเนินการย้ายสต็อก
     */
    public function transfer(Request $request, TransferStockUseCase $transferUseCase)
    {
        $request->validate([
            'item_uuid' => 'required',
            'warehouse_uuid' => 'required', // เพื่อความชัวร์
            'from_location_uuid' => 'required',
            'to_location_uuid' => 'required|different:from_location_uuid',
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string'
        ]);

        try {
            DB::transaction(function () use ($request, $transferUseCase) {
                $data = new TransferStockData(
                    companyId: auth()->user()->company_id,
                    itemUuid: $request->item_uuid,
                    warehouseUuid: $request->warehouse_uuid, // อ้างอิงคลังเดียวกัน
                    fromLocationUuid: $request->from_location_uuid,
                    toLocationUuid: $request->to_location_uuid,
                    quantity: (float)$request->quantity,
                    userId: auth()->id(),
                    reason: $request->reason
                );

                $transferUseCase($data);
            });

            return back()->with('success', 'Stock transferred successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Transfer failed: ' . $e->getMessage());
        }
    }

    /**
     * ✅ [เพิ่มใหม่] ปรับยอดสต็อก (Cycle Count / Adjustment)
     */
    public function adjust(Request $request, AdjustStockUseCase $adjustUseCase)
    {
        $request->validate([
            'item_uuid' => 'required',
            'warehouse_uuid' => 'required',
            'location_uuid' => 'required',
            'new_quantity' => 'required|numeric|min:0', // ยอดใหม่ห้ามติดลบ (แต่เป็น 0 ได้)
            'reason' => 'required|string|max:255' // บังคับใส่เหตุผล
        ]);

        try {
            DB::transaction(function () use ($request, $adjustUseCase) {
                $data = new AdjustStockData(
                    companyId: auth()->user()->company_id,
                    itemUuid: $request->item_uuid,
                    warehouseUuid: $request->warehouse_uuid,
                    locationUuid: $request->location_uuid,
                    newQuantity: (float)$request->new_quantity,
                    userId: auth()->id(),
                    reason: $request->reason
                );

                $adjustUseCase($data);
            });

            return back()->with('success', 'Stock adjusted successfully.');
        } catch (Exception $e) {
            // ถ้าเป็นการแจ้งเตือนว่ายอดเท่าเดิม (ไม่ใช่ Error ร้ายแรง)
            if ($e->getMessage() === "No adjustment needed.") {
                return back()->with('warning', 'No changes made (Quantity is same as current).');
            }
            return back()->with('error', 'Adjustment failed: ' . $e->getMessage());
        }
    }

    /**
     * ✅ [เพิ่มใหม่] API ดึง Location สำหรับ Dropdown ใน Modal
     */
    public function getWarehouseLocations(string $uuid)
    {
        $locations = StorageLocationModel::where('warehouse_uuid', $uuid)
            ->where('is_active', true)
            ->orderBy('code')
            ->select('uuid', 'code', 'type')
            ->get();

        return response()->json($locations);
    }
}
