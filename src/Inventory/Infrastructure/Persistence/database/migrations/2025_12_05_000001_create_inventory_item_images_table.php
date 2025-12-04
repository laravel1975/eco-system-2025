<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_item_images', function (Blueprint $table) {
            $table->id();

            // เชื่อมกับ Item (Cascade Delete: ลบสินค้า รูปลบด้วย)
            $table->foreignUuid('item_uuid')
                  ->constrained('inventory_items', 'uuid')
                  ->cascadeOnDelete();

            $table->string('path'); // Path ของไฟล์ใน Storage (e.g. items/xxx.jpg)
            $table->string('original_name')->nullable(); // ชื่อไฟล์เดิม (เผื่อไว้ดู)
            
            $table->boolean('is_primary')->default(false); // รูปหลักหรือไม่
            $table->integer('sort_order')->default(0); // ลำดับการแสดงผล

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_item_images');
    }
};
