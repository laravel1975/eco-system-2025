<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // ข้อมูลรถ
            $table->string('license_plate')->unique(); // ทะเบียนรถ (e.g. 1กข-1234)
            $table->string('brand')->nullable(); // ยี่ห้อ (Toyota, Isuzu)
            $table->string('model')->nullable(); // รุ่น

            // ประเภทและการเป็นเจ้าของ
            $table->string('vehicle_type')->default('truck_4w'); // truck_4w, truck_6w, pickup, bike
            $table->string('ownership_type')->default('own'); // own (รถบริษัท), rented (รถเช่า/รถร่วม)

            // ข้อมูลคนขับประจำ (Optional)
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();

            // สถานะ: active, maintenance (ซ่อม), inactive
            $table->string('status')->default('active');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_vehicles');
    }
};
