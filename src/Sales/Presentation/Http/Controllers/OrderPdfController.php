<?php

namespace TmrEcosystem\Sales\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use TmrEcosystem\Sales\Domain\Repositories\OrderRepositoryInterface;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;
use TmrEcosystem\Inventory\Application\Contracts\ItemLookupServiceInterface;

class OrderPdfController extends Controller
{
    public function __construct(
        private OrderRepositoryInterface $orderRepo,
        private ItemLookupServiceInterface $itemService,
        private PdfServiceInterface $pdfService
    ) {}

    public function download(string $id)
    {
        $order = $this->orderRepo->findById($id);
        if (!$order) abort(404);

        // ดึงรูปภาพสินค้า
        $productIds = $order->getItems()->map(fn($i) => $i->productId)->toArray();
        $productDetails = $this->itemService->getByPartNumbers($productIds);

        // Mock Customer Data (ควรดึงจาก Relation จริง)
        $customerName = 'Customer Name';
        $customerAddress = 'Bangkok, Thailand';

        $data = [
            'order_number' => $order->getOrderNumber(),
            'date' => now()->format('d M Y'),
            'customer_name' => $customerName,
            'customer_address' => $customerAddress,
            'customer_phone' => $orderModel->customer->phone ?? '-',
            'payment_terms' => $order->getPaymentTerms(),
            'total_amount' => $order->getTotalAmount(),
            // ✅ เพิ่มบรรทัดนี้ (ดึงชื่อคน Login หรือคนสร้างออเดอร์)
            'sales_person' => auth()->user()->name ?? 'Admin',
            'items' => $order->getItems()->map(fn($item) => [
                'product_id' => $item->productId,
                'description' => $item->productName,
                'quantity' => $item->quantity,
                'unit_price' => $item->unitPrice,
                'total' => $item->total(),
                'image_url' => $productDetails[$item->productId]->imageUrl ?? null,
            ])
        ];

        return $this->pdfService->download(
            'pdf.sales.order',
            ['order' => $data],
            "SO-{$order->getOrderNumber()}.pdf"
        );
    }
}
