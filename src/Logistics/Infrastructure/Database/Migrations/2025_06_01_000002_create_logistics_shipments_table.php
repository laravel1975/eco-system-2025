<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_shipments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // เลขที่เอกสารรอบส่ง (e.g. SH-20251123-001)
            $table->string('shipment_number')->unique();

            // เชื่อมโยงกับรถ
            $table->foreignUuid('vehicle_id')->nullable()->constrained('logistics_vehicles')->nullOnDelete();

            // Snapshot ข้อมูลคนขับ (เผื่อเปลี่ยนคนขับหน้างาน หรือเป็นรถเช่าขาจร)
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();

            // วันเวลาเดินทาง
            $table->dateTime('planned_date')->nullable(); // วันที่วางแผนส่ง
            $table->dateTime('departed_at')->nullable(); // รถออกจริง
            $table->dateTime('completed_at')->nullable(); // กลับถึงบริษัท/จบงาน

            // สถานะ: draft, ready (พร้อมออก), in_transit (กำลังส่ง), completed (จบงาน), cancelled
            $table->string('status')->default('draft');

            $table->text('note')->nullable(); // หมายเหตุ เช่น "สายเหนือ", "เก็บเงินปลายทาง"

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_shipments');
    }
};
