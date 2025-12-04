<?php

namespace TmrEcosystem\Logistics\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use TmrEcosystem\Sales\Domain\Events\OrderUpdated;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlip;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlipItem;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;

class SyncLogisticsDocuments implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderUpdated $event): void
    {
        $order = $event->order;
        $orderId = $order->getId();

        Log::info("Logistics: Syncing documents for Updated Order: {$order->getOrderNumber()}");

        DB::transaction(function () use ($order, $orderId) {

            // 1. จัดการใบหยิบสินค้า (Picking Slip)
            $picking = PickingSlip::with('items')
                ->where('order_id', $orderId)
                ->whereIn('status', ['pending', 'assigned']) // แก้ไขได้เฉพาะสถานะนี้
                ->first();

            if ($picking) {
                // === เริ่ม Logic การอัปเดต Items ===

                // ลบ Items เดิมออกทั้งหมด (เพื่อความง่ายในการ Sync)
                // หรือจะใช้ Logic เปรียบเทียบเพื่อ Update/Insert/Delete ก็ได้
                // แต่การลบแล้วสร้างใหม่ (Delete-Insert) ง่ายกว่าในกรณีนี้
                $picking->items()->delete();

                // สร้าง Items ใหม่จาก Order
                foreach ($order->getItems() as $item) {
                    $line = new PickingSlipItem();
                    $line->picking_slip_id = $picking->id;

                    // หา Sales Order Item ID ใหม่
                    $salesOrderItemId = DB::table('sales_order_items')
                        ->where('order_id', $orderId)
                        ->where('product_id', $item->productId)
                        ->value('id');

                    $line->sales_order_item_id = $salesOrderItemId;
                    $line->product_id = $item->productId;
                    $line->quantity_requested = $item->quantity;
                    $line->quantity_picked = 0; // Reset ยอดที่หยิบ (เพราะรายการเปลี่ยน)

                    $line->save();
                }
                // === จบ Logic การอัปเดต Items ===

                // รีเซ็ตสถานะ Picking Slip (เผื่อมีการ Assign ไปแล้ว)
                $picking->update([
                    'status' => 'pending',
                    'note' => trim($picking->note . "\n[System] Order Updated: รายการสินค้าเปลี่ยนแปลง กรุณาตรวจสอบใหม่"),
                    'picker_user_id' => null,
                ]);

                Log::info("Logistics: Updated Picking Slip {$picking->picking_number}");
            } else {
                 Log::warning("Logistics: No editable Picking Slip found for Order {$order->getOrderNumber()}");
            }

            // 2. จัดการใบส่งของ (Delivery Note)
            $delivery = DeliveryNote::where('order_id', $orderId)->first();

            if ($delivery) {
                // ถอยสถานะกลับมารอ Operation
                if (!in_array($delivery->status, ['shipped', 'delivered'])) {
                    $delivery->update([
                        'status' => 'wait_operation'
                    ]);
                    Log::info("Logistics: Reset Delivery Note {$delivery->delivery_number} status");
                }
            }
        });
    }
}
