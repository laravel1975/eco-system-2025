<?php

namespace TmrEcosystem\Sales\Domain\Repositories;

use TmrEcosystem\Sales\Domain\Aggregates\Order;

interface OrderRepositoryInterface
{
    /**
     * บันทึก Order ลงฐานข้อมูล (ทั้ง Insert และ Update)
     */
    public function save(Order $order): void;

    /**
     * ค้นหา Order ตาม ID
     */
    public function findById(string $id): ?Order;
}
