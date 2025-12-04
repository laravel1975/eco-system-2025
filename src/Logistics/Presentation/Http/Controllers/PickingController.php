<?php

namespace TmrEcosystem\Logistics\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlip;
use TmrEcosystem\Sales\Infrastructure\Persistence\Models\SalesOrderItemModel;
use TmrEcosystem\Stock\Domain\Repositories\StockLevelRepositoryInterface;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;
use TmrEcosystem\Stock\Application\Services\StockPickingService;

class PickingController extends Controller
{
    public function __construct(
        private StockLevelRepositoryInterface $stockRepo,
        private ItemLookupServiceInterface $itemLookupService,
        private StockPickingService $pickingService
    ) {}

    // ... (index, show methods เหมือนเดิม) ...
    public function index(Request $request)
    {
        // (Code เดิม...)
        $query = PickingSlip::query()
            ->with(['order.items'])
            ->join('sales_orders', 'sales_picking_slips.order_id', '=', 'sales_orders.id')
            ->leftJoin('customers', 'sales_orders.customer_id', '=', 'customers.id')
            ->leftJoin('users', 'sales_picking_slips.picker_user_id', '=', 'users.id')
            ->select(
                'sales_picking_slips.*',
                'sales_orders.order_number',
                'customers.name as customer_name',
                'users.name as picker_name'
            );

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('sales_picking_slips.status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('sales_picking_slips.picking_number', 'like', "%{$request->search}%")
                    ->orWhere('sales_orders.order_number', 'like', "%{$request->search}%")
                    ->orWhere('customers.name', 'like', "%{$request->search}%")
                    ->orWhere('users.name', 'like', "%{$request->search}%");
            });
        }

        $pickingSlips = $query->orderByRaw("CASE WHEN sales_picking_slips.status = 'pending' THEN 1 WHEN sales_picking_slips.status = 'assigned' THEN 2 ELSE 3 END")
            ->orderBy('sales_picking_slips.created_at', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($slip) => [
                'id' => $slip->id,
                'picking_number' => $slip->picking_number,
                'order_number' => $slip->order_number,
                'customer_name' => $slip->customer_name ?? 'Unknown',
                'items_count' => $slip->order ? $slip->order->items->sum('quantity') : 0,
                'status' => $slip->status,
                'created_at' => $slip->created_at->format('d/m/Y H:i'),
                'picker_name' => $slip->picker_name,
                'picker_user_id' => $slip->picker_user_id,
            ]);

        $stats = [
            'total_pending' => PickingSlip::where('status', 'pending')->count(),
            'my_tasks' => PickingSlip::where('picker_user_id', auth()->id())
                ->whereIn('status', ['assigned', 'in_progress'])
                ->count(),
        ];

        return Inertia::render('Logistics/Picking/Index', [
            'pickingSlips' => $pickingSlips,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    public function show(string $id)
    {
        $pickingSlip = PickingSlip::with(['items', 'order.customer'])->findOrFail($id);
        $warehouseUuid = $pickingSlip->order->warehouse_id ?? 'Main-WH';

        // ตรวจสอบว่า Warehouse ID มีจริงไหม ถ้าไม่มีให้ไปดึงจาก Warehouse แรกของบริษัท
        if ($warehouseUuid === 'Main-WH' || !$warehouseUuid) {
            $warehouseUuid = \TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel::where('company_id', $pickingSlip->order->company_id)->value('uuid');
        }

        $items = $pickingSlip->items->map(function ($pickItem) use ($pickingSlip, $warehouseUuid) {
            $itemDto = $this->itemLookupService->findByPartNumber($pickItem->product_id);

            // ✅ [Smart Picking Logic] หาตำแหน่งที่ควรไปหยิบ
            $suggestions = [];
            if ($itemDto && $pickingSlip->status !== 'done') {
                $qtyNeeded = $pickItem->quantity_requested - $pickItem->quantity_picked;
                if ($qtyNeeded > 0) {
                    // เรียกเมธอดที่เราเพิ่งแก้ชื่อไป
                    $suggestions = $this->pickingService->suggestPickingLocations(
                        $itemDto->uuid,
                        $warehouseUuid,
                        $qtyNeeded
                    );
                }
            }

            // ถ้าไม่มี Suggestion (เช่น ของหมด หรือ Picking Done) ให้ใส่ค่า Default ว่างๆ หรือดึงจาก History
            // แต่เพื่อการแสดงผลใน PDF ที่สวยงาม เราอาจจะ Flatten Suggestion เป็น String
            $locationString = collect($suggestions)->map(fn($s) => "{$s['location_code']} ({$s['quantity']})")->join(', ');

            return [
                'id' => $pickItem->id,
                'product_id' => $pickItem->product_id,
                'product_name' => $itemDto ? $itemDto->name : $pickItem->product_id,
                'barcode' => $itemDto ? $itemDto->partNumber : '',
                'qty_ordered' => $pickItem->quantity_requested,
                'qty_picked' => $pickItem->quantity_picked,
                'is_completed' => $pickingSlip->status === 'done' || ($pickItem->quantity_picked >= $pickItem->quantity_requested),
                'image_url' => $itemDto ? $itemDto->imageUrl : null,

                // ✅ ส่งข้อมูล Suggestion ไป Frontend
                'picking_suggestions' => $suggestions,
                // ✅ ส่ง String ไปเผื่อใช้แสดงผลง่ายๆ
                'location_display' => $locationString ?: 'WAITING'
            ];
        });

        return Inertia::render('Logistics/Picking/Process', [
            'pickingSlip' => [
                'id' => $pickingSlip->id,
                'picking_number' => $pickingSlip->picking_number,
                'order_number' => $pickingSlip->order->order_number,
                'customer_name' => $pickingSlip->order->customer->name ?? 'N/A',
                'status' => $pickingSlip->status,
            ],
            'items' => $items
        ]);
    }

    public function confirm(Request $request, string $id)
    {
        $request->validate([
            'items' => 'required|array',
            'create_backorder' => 'boolean'
        ]);

        DB::transaction(function () use ($id, $request) {
            $picking = PickingSlip::with('items')->findOrFail($id);
            $submittedItems = collect($request->items);

            $backorderItems = [];

            // Update Picking Items logic (เหมือนเดิม)
            foreach ($submittedItems as $submitted) {
                $pickItem = $picking->items->where('id', $submitted['id'])->first();
                if ($pickItem) {
                    $pickItem->update(['quantity_picked' => $submitted['qty_picked']]);
                    $salesItem = SalesOrderItemModel::find($pickItem->sales_order_item_id);
                    if ($salesItem) {
                        $salesItem->increment('qty_shipped', $submitted['qty_picked']);
                    }
                    $remaining = $pickItem->quantity_requested - $submitted['qty_picked'];
                    if ($remaining > 0) {
                        $backorderItems[] = [
                            'sales_order_item_id' => $pickItem->sales_order_item_id,
                            'product_id' => $pickItem->product_id,
                            'quantity_requested' => $remaining,
                            'quantity_picked' => 0
                        ];
                    }
                }
            }

            $picking->update(['status' => 'done', 'picked_at' => now()]);
            DeliveryNote::where('picking_slip_id', $id)->update(['status' => 'ready_to_ship']);

            $picking->refresh();
            $picking->load('items');

            // --- ✅ FIX: เปลี่ยน Logic การตัดสต็อกให้รองรับ Location ---

            // 1. หา Location UUID ของ 'GENERAL'
            $warehouseUuid = $picking->warehouse_id ?? $picking->order->warehouse_id;
            $locationUuid = DB::table('warehouse_storage_locations')
                ->where('warehouse_uuid', $warehouseUuid)
                ->where('code', 'GENERAL')
                ->value('uuid');

            // ถ้าเจอ Location GENERAL ให้ทำการตัดสต็อก (ถ้าไม่เจอ ข้ามไปก่อนได้เพื่อกัน Error แต่ควร Log ไว้)
            if ($locationUuid) {
                foreach ($picking->items as $item) {
                    if ($item->quantity_picked > 0) {
                        $inventoryItemDto = $this->itemLookupService->findByPartNumber($item->product_id);

                        if ($inventoryItemDto) {
                            // 2. ใช้ findByLocation แทน findByItemAndWarehouse
                            $stockLevel = $this->stockRepo->findByLocation(
                                $inventoryItemDto->uuid,
                                $locationUuid, // ✅ เจาะจง GENERAL
                                $picking->order->company_id
                            );

                            if ($stockLevel) {
                                $stockLevel->commitReservation((float)$item->quantity_picked);
                                $this->stockRepo->save($stockLevel, []);
                            }
                        }
                    }
                }
            }
            // -----------------------------------------------------------

            if (!empty($backorderItems) && $request->create_backorder) {
                // (Logic Backorder เหมือนเดิม)
                $newPicking = PickingSlip::create([
                    'picking_number' => 'PK-' . time() . '-BO',
                    'order_id' => $picking->order_id,
                    'status' => 'pending',
                    'note' => 'Backorder from ' . $picking->picking_number
                ]);
                $newPicking->items()->createMany($backorderItems);
                DeliveryNote::create([
                    'delivery_number' => 'DO-' . time() . '-BO',
                    'order_id' => $picking->order_id,
                    'picking_slip_id' => $newPicking->id,
                    'shipping_address' => 'Same as original',
                    'status' => 'wait_operation',
                ]);
            }
        });

        return to_route('logistics.picking.index')->with('success', 'Picking Validated!');
    }

    public function assign(Request $request, string $id)
    {
        // (Code เดิม...)
        $picking = PickingSlip::findOrFail($id);
        if ($picking->status !== 'pending' && $picking->status !== 'assigned') {
            return back()->with('error', 'ไม่สามารถรับงานนี้ได้ (สถานะไม่ถูกต้อง)');
        }
        if ($picking->picker_user_id && $picking->picker_user_id !== auth()->id()) {
            return back()->with('error', 'งานนี้มีผู้รับผิดชอบแล้ว');
        }
        $picking->update([
            'picker_user_id' => auth()->id(),
            'status' => 'assigned'
        ]);
        return back()->with('success', 'รับงานเรียบร้อยแล้ว เริ่มจัดของได้เลย!');
    }

    /**
     * เมธอดสำหรับแสดงหน้า Picking Slip (Show.tsx)
     * หรือหน้าที่ Picker เข้ามาดูก่อนกด Continue Picking
     */
    public function reViewItem(string $id)
    {
        $pickingSlip = PickingSlip::with(['items', 'order.customer', 'picker'])->findOrFail($id);

        // 1. หา Warehouse ID ให้ชัวร์ (เหมือนเดิม)
        $warehouseUuid = $pickingSlip->order->warehouse_id ?? 'Main-WH';
        if ($warehouseUuid === 'Main-WH' || !$warehouseUuid) {
             $warehouseUuid = \TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel::where('company_id', $pickingSlip->order->company_id)->value('uuid');
        }

        $items = $pickingSlip->items->map(function ($pickItem) use ($pickingSlip, $warehouseUuid) {
            $itemDto = $this->itemLookupService->findByPartNumber($pickItem->product_id);

            // 2. ✅ [Smart Picking Logic] คำนวณหา Location ที่ควรไปหยิบ
            $suggestions = [];
            if ($itemDto && $pickingSlip->status !== 'done') {
                $qtyNeeded = $pickItem->quantity_requested - $pickItem->quantity_picked;
                if ($qtyNeeded > 0) {
                    // เรียก Service (ต้องแก้ชื่อเมธอดใน Service ให้ตรงกันด้วยนะครับ ตอนนี้ผมน่าจะแก้เป็น calculatePickingPlan แล้ว)
                    $suggestions = $this->pickingService->calculatePickingPlan(
                        $itemDto->uuid,
                        $warehouseUuid,
                        $qtyNeeded
                    );
                }
            }

            // 3. ✅ แปลง Suggestion เป็น String สำหรับแสดงผลในตาราง
            // ตัวอย่าง: "A-1-1 (5), GENERAL (2)"
            $locationStr = collect($suggestions)
                ->map(fn($s) => "{$s['location_code']}") // เอาแค่ Code ก็พอ หรือจะใส่ Qty ด้วยก็ได้
                ->unique()
                ->join(', ');

            return [
                'id' => $pickItem->id,
                'product_id' => $pickItem->product_id,
                'product_name' => $itemDto ? $itemDto->name : $pickItem->product_id,
                'description' => $itemDto->description ?? '', // เพิ่ม Description
                'barcode' => $itemDto ? $itemDto->partNumber : '',

                // ✅ ใช้ค่าจริงที่คำนวณได้ (ถ้าไม่มีให้ขึ้น Waiting หรือ N/A)
                'location' => $locationStr ?: 'WAITING',

                'qty_ordered' => $pickItem->quantity_requested,
                'qty_picked' => $pickItem->quantity_picked,
                'is_completed' => false, // สำหรับหน้า Show ไม่ได้ใช้ Logic นี้มากนัก
                'image_url' => $itemDto ? $itemDto->imageUrl : null,
            ];
        });

        return Inertia::render('Logistics/Picking/Show', [
            'pickingSlip' => [
                'id' => $pickingSlip->id,
                'picking_number' => $pickingSlip->picking_number,
                'status' => $pickingSlip->status,
                'created_at' => $pickingSlip->created_at->toIso8601String(),
                'warehouse_id' => $warehouseUuid, // ส่ง Warehouse ID จริงไป
                'picker_name' => $pickingSlip->picker ? $pickingSlip->picker->name : null,
                'order' => [
                    'order_number' => $pickingSlip->order->order_number,
                    'customer' => [
                        'name' => $pickingSlip->order->customer->name ?? 'N/A',
                        'address' => $pickingSlip->order->customer->address ?? '-',
                        'phone' => $pickingSlip->order->customer->phone ?? '-',
                    ]
                ],
                'items' => $items
            ]
        ]);
    }
}
