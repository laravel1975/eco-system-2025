<?php

namespace TmrEcosystem\Logistics\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;

class DeliveryPdfController extends Controller
{
    public function __construct(
        private PdfServiceInterface $pdfService,
        private ItemLookupServiceInterface $itemService
    ) {}

    public function download(string $id)
    {
        $delivery = DeliveryNote::with(['pickingSlip.items', 'order.customer'])->findOrFail($id);

        $items = $delivery->pickingSlip->items->map(function ($pickItem) {
            $itemDto = $this->itemService->findByPartNumber($pickItem->product_id);
            return [
                'product_id' => $pickItem->product_id,
                // ✅ เปลี่ยน key จาก 'description' เป็น 'product_name' ให้ตรงกับ Blade
                'product_name' => $itemDto->name ?? $pickItem->product_id,
                'description' => $itemDto->name ?? $pickItem->product_id,
                'quantity' => $pickItem->quantity_picked,
                'image_url' => $itemDto->imageUrl ?? null,
            ];
        });

        $data = [
            'delivery_number' => $delivery->delivery_number,
            'order_number' => $delivery->order->order_number,
            'customer_name' => $delivery->order->customer->name ?? 'N/A',
            'shipping_address' => $delivery->shipping_address,
            'date' => $delivery->created_at->format('d M Y'),
            'items' => $items
        ];

        return $this->pdfService->download(
            'pdf.logistics.delivery', // อย่าลืมสร้างไฟล์ Blade นี้นะครับ
            ['delivery' => $data],
            "DO-{$delivery->delivery_number}.pdf"
        );
    }
}
