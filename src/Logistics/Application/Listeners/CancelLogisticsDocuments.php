<?php

namespace TmrEcosystem\Logistics\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

use TmrEcosystem\Sales\Domain\Events\OrderCancelled;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\PickingSlip;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\ReturnNote;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\ReturnNoteItem;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\Shipment;

class CancelLogisticsDocuments implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderCancelled $event): void
    {
        $order = $event->order;
        $orderId = $order->getId();

        Log::info("Logistics: Cancelling documents for Order: {$order->getOrderNumber()}");

        DB::transaction(function () use ($orderId) {

            // --- 1. จัดการ Picking Slip (ใบหยิบสินค้า) ---
            $picking = PickingSlip::where('order_id', $orderId)->first();

            if ($picking) {
                // เช็คว่ามีการหยิบของออกไปหรือยัง
                $hasPickedItems = $picking->items->sum('quantity_picked') > 0;

                if ($picking->status === 'done' || $hasPickedItems) {

                    // ✅✅ FIX: เพิ่มการเช็ค Duplicate (Idempotency Check)
                    // ตรวจสอบว่ามี Return Note สำหรับ Picking Slip นี้อยู่แล้วหรือไม่
                    $exists = ReturnNote::where('picking_slip_id', $picking->id)->exists();

                    if (!$exists) {
                        // ถ้ายังไม่มี ค่อยสร้างใหม่
                        $returnNote = ReturnNote::create([
                            'return_number' => 'RN-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                            'order_id' => $orderId,
                            'picking_slip_id' => $picking->id,
                            'status' => 'pending',
                            'reason' => 'Order Cancelled after Picking'
                        ]);

                        foreach ($picking->items as $item) {
                            if ($item->quantity_picked > 0) {
                                ReturnNoteItem::create([
                                    'return_note_id' => $returnNote->id,
                                    'product_id' => $item->product_id,
                                    'quantity' => $item->quantity_picked
                                ]);
                            }
                        }

                        Log::warning("Logistics: Created Return Note {$returnNote->return_number} for Cancelled Order.");
                    } else {
                        Log::info("Logistics: Return Note already exists for Picking Slip {$picking->picking_number}. Skipping creation.");
                    }
                }

                // อัปเดตสถานะ Picking เป็น Cancelled (ทำซ้ำได้ไม่เป็นไร)
                $picking->update(['status' => 'cancelled']);
            }

            // --- 2. จัดการ Delivery Note & Shipment (เหมือนเดิม) ---
            $delivery = DeliveryNote::where('order_id', $orderId)->first();
            if ($delivery) {
                $shipmentId = $delivery->shipment_id;

                $delivery->update([
                    'status' => 'cancelled',
                    'shipment_id' => null
                ]);

                if ($shipmentId) {
                    $remainingDeliveries = DeliveryNote::where('shipment_id', $shipmentId)->count();
                    if ($remainingDeliveries === 0) {
                        Shipment::where('id', $shipmentId)->update(['status' => 'cancelled']);
                    }
                }
            }
        });
    }
}
