<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

// (Maintenance BC)
use TmrEcosystem\Maintenance\Domain\Models\SparePart;
use TmrEcosystem\Maintenance\Presentation\Requests\StoreSparePartRequest;
use TmrEcosystem\Maintenance\Presentation\Requests\UpdateSparePartRequest;
use TmrEcosystem\Maintenance\Presentation\Requests\AdjustSparePartStockRequest;

// (Inventory BC)
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\ItemModel;

// (Stock BC)
use TmrEcosystem\Stock\Application\UseCases\AdjustStockUseCase;
use TmrEcosystem\Stock\Application\DTOs\AdjustStockData;
// (1. 👈 [ใหม่] Import StockLevelModel เพื่อ Query ยอด)
use TmrEcosystem\Stock\Infrastructure\Persistence\Eloquent\Models\StockLevelModel;

class SparePartController extends Controller
{
    /**
     * (Read) แสดงรายการอะไหล่ทั้งหมด
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $query = SparePart::where('company_id', $companyId);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('part_number', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->get('filter') === 'low_stock') {
            $query->whereRaw('stock_quantity <= reorder_level');
        }

        $spareParts = $query->latest()->paginate(15);

        return inertia('Maintenance/SpareParts/Index', [
            'spareParts' => $spareParts,
            'filters' => $request->only('search', 'filter'),
        ]);
    }

    /**
     * (Create) แสดงฟอร์มสร้างอะไหล่
     */
    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        $items = ItemModel::where('company_id', $companyId)
            ->whereDoesntHave('sparePart')
            ->get(['uuid', 'name', 'part_number']);

        return inertia('Maintenance/SpareParts/Create', [
            'items' => $items
        ]);
    }

    /**
     * (Create) บันทึกอะไหล่ใหม่
     */
    public function store(StoreSparePartRequest $request): RedirectResponse
    {
        $companyId = $request->user()->company_id;
        SparePart::create($request->validated() + ['company_id' => $companyId]);

        return redirect()->route('maintenance.spare-parts.index')
                         ->with('success', 'สร้างอะไหล่เรียบร้อย');
    }

    /**
     * (2. 👈 [แก้ไข] Read) แสดงหน้ารายละเอียดอะไหล่
     */
    public function show(SparePart $sparePart)
    {
        // (ACL) เรายังคงแสดง 'stock_quantity' (เก่า) ได้
        // (เพื่อความเข้ากันได้กับโค้ดเก่า)

        // (3. 👈 [ใหม่] เพิ่ม Logic Pager (เหมือน AssetController@show))
        $companyId = $sparePart->company_id;
        $query = SparePart::where('company_id', $companyId)->orderBy('id', 'asc');

        $allSparePartIds = $query->pluck('id')->all();
        $currentIndex = array_search($sparePart->id, $allSparePartIds);
        $total = count($allSparePartIds);

        $nextId = $allSparePartIds[$currentIndex + 1] ?? null;
        $prevId = $allSparePartIds[$currentIndex - 1] ?? null;

        // (4. 👈 [ใหม่] ดึงยอดสต็อก "จริง" (Per-Warehouse) จาก Stock BC)
        $stockDetails = [];
        if ($sparePart->item_uuid) {
            $stockDetails = StockLevelModel::where('item_uuid', $sparePart->item_uuid)
                ->where('company_id', $companyId)
                ->where('quantity_on_hand', '>', 0)
                // (Eager load 'warehouse' relation จาก Warehouse BC)
                ->with('warehouse:uuid,name,code')
                ->get(['warehouse_uuid', 'quantity_on_hand']);
        }

        return inertia('Maintenance/SpareParts/Show', [
            'sparePart' => $sparePart,
            'stockDetails' => $stockDetails, // (ส่งยอดสต็อกแยกคลังไป)

            // (5. 👈 [ใหม่] ส่ง 'paginationInfo' (ที่ Frontend คาดหวัง))
            'paginationInfo' => [
                'current_index' => $currentIndex + 1,
                'total' => $total,
                'next_sp_id' => $nextId, // (ใช้ 'sp' prefix)
                'prev_sp_id' => $prevId, // (ใช้ 'sp' prefix)
            ]
        ]);
    }

    /**
     * (Update) แสดงฟอร์มแก้ไขอะไหล่
     */
    public function edit(Request $request, SparePart $sparePart)
    {
        $companyId = $request->user()->company_id;

        $items = ItemModel::where('company_id', $companyId)
            ->where(function ($query) use ($sparePart) {
                $query->whereDoesntHave('sparePart')
                      ->orWhere('uuid', $sparePart->item_uuid);
            })
            ->get(['uuid', 'name', 'part_number']);

        return inertia('Maintenance/SpareParts/Edit', [
            'sparePart' => $sparePart,
            'items' => $items
        ]);
    }

    /**
     * (Update) อัปเดตข้อมูลอะไหล่
     */
    public function update(UpdateSparePartRequest $request, SparePart $sparePart): RedirectResponse
    {
        $sparePart->update($request->validated());

        return redirect()->route('maintenance.spare-parts.show', $sparePart)
                         ->with('success', 'อัปเดตอะไหล่เรียบร้อย');
    }

    /**
     * (Delete) ลบอะไหล่
     */
    public function destroy(SparePart $sparePart): RedirectResponse
    {
        if ($sparePart->workOrderUsages()->exists()) {
            return redirect()->back()
                ->with('error', 'ไม่สามารถลบอะไหล่ได้ เนื่องจากมีประวัติการใช้งาน');
        }

        $sparePart->delete();

        return redirect()->route('maintenance.spare-parts.index')
                         ->with('success', 'ลบอะไหล่เรียบร้อย');
    }

    /**
     * (Bonus Feature) ปรับยอดสต็อก (Inventory Adjustment)
     */
    public function adjustStock(
        AdjustSparePartStockRequest $request,
        SparePart $sparePart,
        AdjustStockUseCase $adjustStock
    ): RedirectResponse {

        $companyId = $request->user()->company_id;
        $userId = Auth::id();

        try {
            if (empty($sparePart->item_uuid)) {
                throw new \Exception("Spare part '{$sparePart->name}' is not linked to an Inventory Item.");
            }
            $itemUuid = $sparePart->item_uuid;

            $warehouseUuid = $request->validated('warehouse_uuid');

            $stockData = new AdjustStockData(
                companyId: $companyId,
                itemUuid: $itemUuid,
                warehouseUuid: $warehouseUuid,
                newQuantity: (float) $request->validated('new_quantity'),
                userId: $userId,
                reason: $request->validated('reason')
            );

            $adjustStock($stockData);

            return redirect()->back()->with('success', 'ปรับสต็อกเรียบร้อย');

        } catch (\Exception $e) {
            Log::error("Stock Adjustment Failed (SparePart: {$sparePart->id}): " . $e->getMessage());
            return redirect()->back()->with('error', 'An unexpected error occurred: ' . $e->getMessage());
        }
    }
}
