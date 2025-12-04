<?php

namespace TmrEcosystem\Logistics\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\Shipment;
use TmrEcosystem\Shared\Application\Contracts\PdfServiceInterface;

class ShipmentPdfController extends Controller
{
    public function __construct(
        private PdfServiceInterface $pdfService
    ) {}

    public function download(string $id)
    {
        // ดึงข้อมูล Shipment พร้อม Delivery Notes และข้อมูลลูกค้า
        $shipment = Shipment::with(['vehicle', 'deliveryNotes.order.customer'])
            ->findOrFail($id);

        $deliveries = $shipment->deliveryNotes->map(function ($dn) {
            return [
                'delivery_number' => $dn->delivery_number,
                'customer_name' => $dn->order->customer->name ?? 'N/A',
                'address' => $dn->shipping_address,
                'order_number' => $dn->order->order_number,
                // นับจำนวนกล่อง/ชิ้นรวม (ถ้ามีข้อมูล)
                'total_items' => $dn->pickingSlip->items->sum('quantity_picked') ?? 0
            ];
        });

        $data = [
            'shipment_number' => $shipment->shipment_number,
            'date' => $shipment->planned_date->format('d/m/Y'),
            'driver_name' => $shipment->driver_name,
            'driver_phone' => $shipment->driver_phone,
            'vehicle' => $shipment->vehicle ? "{$shipment->vehicle->license_plate} ({$shipment->vehicle->vehicle_type})" : 'N/A',
            'deliveries' => $deliveries,
            'total_drops' => $deliveries->count(),
            'notes' => $shipment->note
        ];

        // คุณต้องสร้างไฟล์ Blade: resources/views/pdf/logistics/manifest.blade.php
        return $this->pdfService->download(
            'pdf.logistics.manifest',
            ['shipment' => $data],
            "MANIFEST-{$shipment->shipment_number}.pdf"
        );
    }
}
