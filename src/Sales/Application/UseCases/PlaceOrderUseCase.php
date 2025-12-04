<?php

namespace TmrEcosystem\Sales\Application\UseCases;

use Exception;
use Illuminate\Support\Facades\DB;
use TmrEcosystem\Sales\Application\DTOs\CreateOrderDto;
use TmrEcosystem\Sales\Domain\Aggregates\Order;
use TmrEcosystem\Sales\Domain\Repositories\OrderRepositoryInterface;
use TmrEcosystem\Sales\Domain\Services\ProductCatalogInterface;
// ✅ Import Communication Model
use TmrEcosystem\Communication\Infrastructure\Persistence\Models\CommunicationMessage;

class PlaceOrderUseCase
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private ProductCatalogInterface $productCatalog
    ) {}

    /**
     * @throws Exception
     */
    public function handle(CreateOrderDto $dto): Order
    {
        // 1. Prepare Data (Fetch Prices)
        // ดึงข้อมูลสินค้าจาก Inventory (Batch Query) เพื่อ Performance และความถูกต้องของราคา
        $productIds = array_map(fn($item) => $item->productId, $dto->items);
        $products = $this->productCatalog->getProductsByIds($productIds);

        return DB::transaction(function () use ($dto, $products) {

            // 2. Create Aggregate Root with Context
            // ✅ [ปรับปรุง] ส่ง companyId และ warehouseId เข้าไปใน Constructor
            $order = new Order(
                customerId: $dto->customerId,
                companyId: $dto->companyId,   // ต้องมั่นใจว่า DTO มี property นี้แล้ว
                warehouseId: $dto->warehouseId // ต้องมั่นใจว่า DTO มี property นี้แล้ว
            );

            // 3. Add Items
            foreach ($dto->items as $itemDto) {
                $product = $products[$itemDto->productId] ?? null;

                // Validation: สินค้าต้องมีอยู่จริง
                if (!$product) {
                    throw new Exception("Product ID {$itemDto->productId} not found in catalog.");
                }

                // Business Logic: เพิ่มสินค้าเข้า Order (ใช้ราคาจาก Catalog เท่านั้น)
                $order->addItem(
                    productId: $product->id,
                    productName: $product->name,
                    price: $product->price, // 🛡️ Security: ใช้ราคาจากระบบ ห้ามใช้จาก DTO
                    quantity: $itemDto->quantity
                );
            }

            // 4. Update Details (Optional)
            // ถ้ามี Note หรือ Payment Terms ส่งมาด้วย ให้ update เข้าไป
            // (ต้องเช็คว่า DTO คุณมี field note/paymentTerms หรือไม่ ถ้าไม่มีให้ลบส่วนนี้ออกหรือส่ง null)
            $order->updateDetails(
                customerId: $dto->customerId,
                note: $dto->note ?? null,
                paymentTerms: $dto->paymentTerms ?? null
            );

            // 5. Confirm Order (Optional)
            // หากต้องการให้สร้างแล้ว Confirm ทันที (เช่น POS หน้าร้าน)
            // if ($dto->confirmOrder) {
            //     $order->confirm();
            // }

            // 6. Save Aggregate
            $this->orderRepository->save($order);

            // 7. ✅ Auto Log to Communication Module
            // บันทึก Activity Log ตามที่คุณต้องการ
            CommunicationMessage::create([
                'user_id' => auth()->id(), // ⚠️ Note: การใช้ auth() ใน UseCase ถือเป็น Implicit Dependency แต่ยอมรับได้ใน Laravel
                'body' => "Order Created (สร้างใบเสนอราคาใหม่) #{$order->getOrderNumber()}",
                'type' => 'notification',
                'model_type' => 'sales_order', // Polymorphic relation key
                'model_id' => $order->getId()
            ]);

            return $order;
        });
    }
}
