<?php

namespace TmrEcosystem\Logistics\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlip;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;
// ✅ เพิ่ม Import Service
use TmrEcosystem\Stock\Application\Services\StockPickingService;

class PickingPdfController extends Controller
{
    public function __construct(
        private PdfServiceInterface $pdfService,
        private ItemLookupServiceInterface $itemService,
        // ✅ Inject Service เข้ามาตรงนี้
        private StockPickingService $pickingService
    ) {}

    public function download(string $id)
    {
        $pickingSlip = PickingSlip::with(['items', 'order.customer', 'picker'])->findOrFail($id);

        // กันเหนียว: หา Warehouse ID ให้เจอ
        $warehouseUuid = $pickingSlip->order->warehouse_id ?? 'Main-WH';
        if ($warehouseUuid === 'Main-WH' || !$warehouseUuid) {
             $warehouseUuid = \TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Models\WarehouseModel::where('company_id', $pickingSlip->order->company_id)->value('uuid');
        }

        $items = $pickingSlip->items->map(function ($pickItem) use ($warehouseUuid) {
            $itemDto = $this->itemService->findByPartNumber($pickItem->product_id);

            // ✅ ใช้ Service คำนวณแผนการหยิบ (Smart Picking)
            $suggestions = [];
            if ($itemDto) {
                 $suggestions = $this->pickingService->calculatePickingPlan( // ใช้ชื่อเมธอดใหม่
                    $itemDto->uuid,
                    $warehouseUuid,
                    (float)$pickItem->quantity_requested
                );
            }

            // แปลงเป็น String สำหรับแสดงใน PDF
            // เช่น "A-1-1 (5), GENERAL (2)"
            $locationStr = collect($suggestions)
                ->map(fn($s) => "{$s['location_code']} ({$s['quantity']})")
                ->join(', ');

            return [
                'product_id' => $pickItem->product_id,
                'product_name' => $itemDto->name ?? $pickItem->product_id,
                'description' => $itemDto->description ?? '',
                'barcode' => $itemDto->barcode ?? $itemDto->partNumber,

                // ✅ ใช้ค่าที่คำนวณได้
                'location' => $locationStr ?: 'N/A',

                'quantity' => $pickItem->quantity_requested,
                'qty_picked' => $pickItem->quantity_picked,
                'image_url' => $itemDto->imageUrl ?? null,
            ];
        });

        $data = [
            'picking_number' => $pickingSlip->picking_number,
            'order_number' => $pickingSlip->order->order_number,
            'warehouse_id' => $warehouseUuid, // อาจจะเปลี่ยนเป็น Warehouse Code/Name ถ้าต้องการ
            'date' => $pickingSlip->created_at->format('d M Y H:i'),
            'picker_name' => $pickingSlip->picker->name ?? 'Unassigned',
            'customer_name' => $pickingSlip->order->customer->name ?? 'N/A',
            'shipping_address' => $pickingSlip->order->customer->address ?? '-',
            'items' => $items
        ];

        return $this->pdfService->download(
            'pdf.logistics.picking',
            ['picking' => $data],
            "PK-{$pickingSlip->picking_number}.pdf"
        );
    }
}
