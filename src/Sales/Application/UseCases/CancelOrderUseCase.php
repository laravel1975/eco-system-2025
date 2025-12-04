<?php

namespace TmrEcosystem\Sales\Application\UseCases;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use TmrEcosystem\Sales\Domain\Repositories\OrderRepositoryInterface;
use TmrEcosystem\Communication\Infrastructure\Persistence\Models\CommunicationMessage;
use TmrEcosystem\Logistics\Infrastructure\Persistence\Models\DeliveryNote;
use TmrEcosystem\Sales\Domain\Events\OrderCancelled;

class CancelOrderUseCase
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository
    ) {}

    public function handle(string $orderId): void
    {
        $order = $this->orderRepository->findById($orderId);
        if (!$order) throw new Exception("Order not found");

        // ✅ 1. เพิ่ม Validation: ห้ามยกเลิกถ้าส่งของไปแล้ว
        $delivery = DeliveryNote::where('order_id', $orderId)->first();
        if ($delivery && in_array($delivery->status, ['shipped', 'delivered'])) {
            throw new Exception("ไม่สามารถยกเลิกออเดอร์ได้ เนื่องจากสินค้าถูกจัดส่งแล้ว (กรุณาทำใบคืนสินค้าแทน)");
        }

        DB::transaction(function () use ($order, $orderId) {
            // 1. เรียก Domain Logic
            $order->cancel();

            // 2. บันทึกสถานะใหม่ลง DB
            $this->orderRepository->save($order);

            // 3. บันทึก Log ลง Chatter
            CommunicationMessage::create([
                'user_id' => auth()->id(),
                'body' => "Order has been CANCELLED (ยกเลิกใบสั่งขาย)",
                'type' => 'notification',
                'model_type' => 'sales_order',
                'model_id' => $orderId
            ]);

            // 4. ✅ [เพิ่ม] Trigger Event ให้ระบบอื่นทำงานต่อ (Stock, Logistics)
            OrderCancelled::dispatch($order);

            Log::info("Sales BC: Order {$order->getOrderNumber()} cancelled. Event dispatched.");
        });
    }
}
