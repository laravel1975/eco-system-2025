<?php

namespace TmrEcosystem\Maintenance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // (Import DB)
use TmrEcosystem\Inventory\Infrastructure\Persistence\Eloquent\Models\ItemModel;
// (Maintenance BC Models)
use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;
use TmrEcosystem\Maintenance\Domain\Models\SparePart;
use TmrEcosystem\Maintenance\Domain\Models\WorkOrderSparePart;
// (เราไม่จำเป็นต้องใช้ Asset Model ที่นี่ เพราะ WorkOrder มี relation อยู่แล้ว)

// (Stock BC Imports)
use TmrEcosystem\Stock\Application\UseCases\IssueStockUseCase;
use TmrEcosystem\Stock\Application\UseCases\ReceiveStockUseCase;
use TmrEcosystem\Stock\Application\DTOs\IssueStockData;
use TmrEcosystem\Stock\Application\DTOs\ReceiveStockData;
use TmrEcosystem\Stock\Domain\Exceptions\InsufficientStockException;

class WorkOrderSparePartController extends Controller
{
    /**
     * (Feature E) บันทึกการใช้อะไหล่
     * (*** Refactored for Cost (Problem 3) ***)
     */
    public function store(
        Request $request,
        WorkOrder $workOrder,
        IssueStockUseCase $issueStock
    ): RedirectResponse {

        $companyId = $workOrder->company_id;
        $userId = Auth::id();

        $validated = $request->validate([
            'spare_part_id' => [
                'required',
                Rule::exists('spare_parts', 'id')->where('company_id', $companyId)
            ],
            'quantity_used' => 'required|numeric|min:0.0001',
        ]);

        $quantityUsed = (float) $validated['quantity_used'];

        DB::beginTransaction();

        try {
            // (1. หา "กุญแจเชื่อม" (Keys))

            $sparePart = SparePart::find($validated['spare_part_id']);
            if (empty($sparePart->item_uuid)) {
                throw new \Exception("Spare part '{$sparePart->name}' is not linked to an Inventory Item.");
            }
            $itemUuid = $sparePart->item_uuid; // (กุญแจที่ 1)

            $asset = $workOrder->asset;
            if (empty($asset) || empty($asset->warehouse_uuid)) {
                throw new \Exception("Asset '{$asset->name}' is not linked to a Warehouse.");
            }
            $warehouseUuid = $asset->warehouse_uuid; // (กุญแจที่ 2)

            // (2. สร้าง DTO สำหรับ Stock BC - เหมือนเดิม)
            $stockData = new IssueStockData(
                companyId: $companyId,
                itemUuid: $itemUuid,
                warehouseUuid: $warehouseUuid,
                quantity: $quantityUsed,
                userId: $userId,
                reference: $workOrder->work_order_code
            );

            // (3. (DDD) เรียกใช้ Stock BC - เหมือนเดิม)
            $issueStock($stockData);

            // (4. (👈 [แก้ไข] "Cost Snapshotting" ที่ถูกต้อง))
            // (ดึง "ความจริง" (Source of Truth) จาก Inventory BC)
            $item = ItemModel::where('uuid', $itemUuid)
                             ->where('company_id', $companyId)
                             ->first();

            if (!$item) {
                // (นี่คือ Error ร้ายแรง ถ้า ACL ทำงานถูก ต้องเจอ)
                throw new \Exception("Inventory Item (UUID: {$itemUuid}) not found.");
            }

            // (ใช้ 'average_cost' จาก ItemModel แทน 'unit_cost' จาก SparePart)
            $costAtTime = $item->average_cost;

            // (5. (ถ้าสำเร็จ) บันทึก Log ใน Maintenance BC)
            $workOrder->sparePartsUsed()->create([
                'spare_part_id' => $sparePart->id,
                'quantity_used' => $quantityUsed,
                'unit_cost_at_time' => $costAtTime, // (บันทึก Snapshot ที่ถูกต้อง)
            ]);

            // (6. Commit Transaction)
            DB::commit();

            return redirect()->back()->with('success', 'บันทึกการใช้อะไหล่และตัดสต็อกเรียบร้อย');

        } catch (InsufficientStockException $e) {
            DB::rollBack();
            Log::warning("Stock Issue Failed (WO: {$workOrder->work_order_code}): " . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Stock Issue Failed (WO: {$workOrder->work_order_code}): " . $e->getMessage());
            return redirect()->back()->with('error', 'An unexpected error occurred: ' . $e->getMessage());
        }
    }

    /**
     * (Feature E) ลบ/ยกเลิก การใช้อะไหล่ (และคืนสต็อก)
     */
    public function destroy(
        WorkOrder $workOrder,
        WorkOrderSparePart $sparePartLog,
        ReceiveStockUseCase $receiveStock
    ): RedirectResponse {
        // ... (โค้ด 'destroy' ที่เราทำเสร็จแล้ว - ไม่ต้องแก้ไข) ...
        // (การ "คืน" สต็อก ไม่จำเป็นต้องยุ่งกับ "ต้นทุน")
        DB::beginTransaction();
        try {
            $sparePart = $sparePartLog->sparePart;
            if (empty($sparePart->item_uuid)) {
                throw new \Exception("Spare part '{$sparePart->name}' is not linked to an Inventory Item.");
            }
            $itemUuid = $sparePart->item_uuid;

            $asset = $workOrder->asset;
            if (empty($asset) || empty($asset->warehouse_uuid)) {
                throw new \Exception("Asset '{$asset->name}' is not linked to a Warehouse.");
            }
            $warehouseUuid = $asset->warehouse_uuid;

            $quantityToReturn = (float) $sparePartLog->quantity_used;

            $stockData = new ReceiveStockData(
                companyId: $workOrder->company_id,
                itemUuid: $itemUuid,
                warehouseUuid: $warehouseUuid,
                quantity: $quantityToReturn,
                userId: Auth::id(),
                reference: "RETURN: " . $workOrder->work_order_code
            );

            $receiveStock($stockData);
            $sparePartLog->delete();
            DB::commit();

            return redirect()->back()->with('success', 'ยกเลิกการใช้อะไหล่และคืนสต็อกเรียบร้อย');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Stock Return Failed (WO: {$workOrder->work_order_code}): " . $e->getMessage());
            return redirect()->back()->with('error', 'An unexpected error occurred during stock return.');
        }
    }
}
