<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use TmrEcosystem\IAM\Domain\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // --- 1. Keys ---

            // (เชื่อมโยงกับ "ยอด" ที่มันไปกระทบ)
            $table->foreignUuid('stock_level_uuid')
                ->constrained(
                    table: 'stock_levels', // (เชื่อมไปตาราง stock_levels)
                    column: 'uuid'          // (เชื่อมไปที่คอลัมน์ 'uuid')
                )
                ->cascadeOnDelete();

            // (User ที่ทำรายการ)
            $table->foreignIdFor(User::class)
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // --- 2. Movement Details ---

            // (ประเภท: RECEIPT, ISSUE, TRANSFER, ADJUST)
            $table->string('type', 50)->index();

            // (จำนวนที่เปลี่ยนแปลง +/-)
            $table->decimal('quantity_change', 15, 4);

            // (ยอดคงเหลือ "ณ ขณะนั้น" หลังทำรายการ)
            $table->decimal('quantity_after_move', 15, 4);

            // --- 3. References ---
            $table->string('reference')->nullable()->index(); // (เช่น PO-123, SO-456)
            $table->text('notes')->nullable();

            // (ใช้ created_at เป็น "วันที่ทำรายการ")
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
