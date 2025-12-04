<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouse_storage_locations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // 1. ผูกกับ Warehouse (คลังแม่)
            // เชื่อมด้วย UUID ตาม Standard ของโปรเจคนี้
            $table->foreignUuid('warehouse_uuid')
                  ->constrained('warehouses', 'uuid')
                  ->cascadeOnDelete();

            // 2. Location Identity
            // code: รหัสที่มนุษย์อ่าน (Human Readable) เช่น "A-01-01"
            $table->string('code');
            // barcode: รหัสสำหรับยิง (Machine Readable) อาจจะเหมือน code หรือเป็น running number ก็ได้
            $table->string('barcode')->index();

            // 3. Properties
            // type: ประเภทพื้นที่ เช่น PICKING (หยิบ), BULK (เก็บสต็อกใหญ่), RETURN (รับคืน), DAMAGED (ของเสีย)
            $table->string('type')->default('PICKING');
            $table->string('description')->nullable();

            // (Optional) ขนาดพื้นที่ เผื่อทำ Capacity Calculation ในอนาคต
            // $table->decimal('max_weight', 10, 2)->nullable();
            // $table->decimal('max_volume', 10, 2)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Constraint: ห้ามตั้งชื่อซ้ำในคลังเดียวกัน (เช่น A-01-01 มีได้ที่เดียวในคลังนี้)
            $table->unique(['warehouse_uuid', 'code']);
            // Barcode ห้ามซ้ำในคลังเดียวกัน (หรือทั้งระบบก็ได้ แล้วแต่ Design)
            $table->unique(['warehouse_uuid', 'barcode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_storage_locations');
    }
};
