<?php

namespace TmrEcosystem\Logistics\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;
// Event จาก Sales
use TmrEcosystem\Sales\Domain\Events\OrderConfirmed;

// Models ของ Logistics
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlip;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlipItem;

class CreateLogisticsDocuments implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderConfirmed $event): void
    {
        $order = $event->order;

        Log::info("Logistics: Processing document creation for Order: {$order->getOrderNumber()}");

        // 1. Idempotency Check (เช็คว่ามีใบ Picking Slip ของ Order นี้หรือยัง)
        // $exists = PickingSlip::where('order_id', $order->getId())->exists();

        // if ($exists) {
        //     Log::warning("Logistics: Picking Slip for Order {$order->getOrderNumber()} already exists. Skipping.");
        //     return;
        // }

        // 2. Create Picking Slip
        DB::transaction(function () use ($order) {

            $pickingSlip = new PickingSlip();
            $pickingSlip->picking_number = 'PK-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            // ✅ Key หลัก: เชื่อมโยงกับ Order
            $pickingSlip->order_id = $order->getId();

            // ❌ ลบ Field ที่ไม่มีใน DB ออกป้องกัน Error SQL
            // $pickingSlip->order_number = ...;
            // $pickingSlip->customer_name = ...;
            // $pickingSlip->warehouse_id = ...;

            $pickingSlip->status = 'pending';
            $pickingSlip->created_at = now();
            $pickingSlip->updated_at = now();

            $pickingSlip->save();

            // 2.2 สร้าง Items
            foreach ($order->getItems() as $item) {

                $line = new PickingSlipItem();
                $line->picking_slip_id = $pickingSlip->id;

                // ค้นหา ID ของ Sales Order Item เพื่อการเชื่อมโยงที่สมบูรณ์
                $salesOrderItemId = DB::table('sales_order_items')
                    ->where('order_id', $order->getId())
                    ->where('product_id', $item->productId)
                    ->value('id');

                $line->sales_order_item_id = $salesOrderItemId;

                // ✅ ข้อมูลสินค้า (บันทึกเฉพาะที่มีใน Migration)
                $line->product_id = $item->productId;
                $line->quantity_requested = $item->quantity;
                $line->quantity_picked = 0;

                // ❌ ลบ Field ที่ไม่มีใน DB ออก
                // $line->item_uuid = ...;
                // $line->product_name = ...;
                // $line->product_code = ...;

                $line->save();
            }

            // --- C. ✅ สร้าง Delivery Note (เพิ่มส่วนนี้) ---
            $deliveryNote = new DeliveryNote();
            $deliveryNote->delivery_number = 'DO-' . date('Ymd') . '-' . strtoupper(Str::random(4));
            $deliveryNote->order_id = $order->getId();

            // เชื่อมโยงกับ Picking Slip ที่เพิ่งสร้าง
            $deliveryNote->picking_slip_id = $pickingSlip->id;

            // Snapshot ข้อมูลลูกค้าสำหรับการจัดส่ง
            $deliveryNote->shipping_address = $customer->address ?? 'N/A';
            $deliveryNote->contact_person = $customer->name ?? 'N/A';
            $deliveryNote->contact_phone = $customer->phone ?? null;

            // สถานะเริ่มต้นคือ 'wait_operation' (รอการหยิบสินค้าเสร็จสิ้น)
            $deliveryNote->status = 'wait_operation';

            $deliveryNote->created_at = now();
            $deliveryNote->updated_at = now();
            $deliveryNote->save();

            Log::info("Logistics: Created Picking Slip {$pickingSlip->picking_number} successfully.");
            Log::info("Logistics: Created Delivery Slip {$deliveryNote->delivery_number} successfully.");
        });
    }
}
