<?php

namespace TmrEcosystem\Logistics\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\ReturnNote;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;

class ReturnNotePdfController extends Controller
{
    public function __construct(
        private PdfServiceInterface $pdfService,
        private ItemLookupServiceInterface $itemService
    ) {}

    public function download(string $id)
    {
        $returnNote = ReturnNote::with(['items', 'order.customer', 'evidenceImages'])->findOrFail($id);

        $items = $returnNote->items->map(function ($item) {
            $itemDto = $this->itemService->findByPartNumber($item->product_id);
            return [
                'product_id' => $item->product_id,
                'product_name' => $itemDto->name ?? $item->product_id,
                'quantity' => $item->quantity,
                'image_url' => $itemDto->imageUrl ?? null,
            ];
        });

        $evidences = $returnNote->evidenceImages->map(fn($e) => $e->url)->toArray();

        $data = [
            'return_number' => $returnNote->return_number,
            'order_number' => $returnNote->order->order_number ?? '-',
            'customer_name' => $returnNote->order->customer->name ?? 'N/A',
            'date' => $returnNote->created_at->format('d M Y'),
            'reason' => $returnNote->reason,
            'status' => $returnNote->status,
            'items' => $items,
            'evidences' => $evidences
        ];

        return $this->pdfService->download(
            'pdf.logistics.return', // ต้องสร้างไฟล์ Blade นี้
            ['returnNote' => $data],
            "RN-{$returnNote->return_number}.pdf"
        );
    }
}
