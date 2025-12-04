<?php

namespace TmrEcosystem\Sales\Application\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use TmrEcosystem\Logistics\Domain\Events\DeliveryNoteCancelled;
use TmrEcosystem\Sales\Application\UseCases\CancelOrderUseCase;

class CancelOrderOnDeliveryFailure implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private CancelOrderUseCase $cancelOrderUseCase
    ) {}

    public function handle(DeliveryNoteCancelled $event): void
    {
        $delivery = $event->deliveryNote;
        $orderId = $delivery->order_id;

        Log::info("Sales BC: Received Delivery Cancelled Event for Order ID: {$orderId}. Attempting to cancel order.");

        try {
            // เรียก Use Case เดิมที่มีอยู่แล้ว (Reuse Logic)
            // Use Case นี้จะจัดการเรื่องเปลี่ยนสถานะ, คืน Soft Reserve, และ Log
            $this->cancelOrderUseCase->handle($orderId);

            Log::info("Sales BC: Order {$orderId} cancelled successfully via Logistics Event.");

        } catch (\Exception $e) {
            Log::error("Sales BC: Failed to auto-cancel order {$orderId}: " . $e->getMessage());
        }
    }
}
