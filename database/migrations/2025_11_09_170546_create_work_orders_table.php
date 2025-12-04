<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// (1. [แก้ไข] เราไม่จำเป็นต้อง use Model ที่นี่แล้ว)
// use TmrEcosystem\Maintenance\Domain\Models\WorkOrder;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('work_order_code')->unique();

            $table->foreignId('maintenance_request_id')
                  ->nullable()
                  ->constrained('maintenance_requests');

            $table->foreignId('maintenance_type_id')
                  ->constrained('maintenance_types');

            $table->foreignId('asset_id')->constrained('assets');

            // ( ⬇️ ⬇️ ⬇️ [แก้ไข] ⬇️ ⬇️ ⬇️ )
            // (ใช้ string 'open' และ 'medium' ซึ่งเป็นค่าดั้งเดิม)
            $table->string('status')->default('open')->index();
            $table->string('priority')->default('medium');
            // ( ⬆️ ⬆️ ⬆️ [สิ้นสุดการแก้ไข] ⬆️ ⬆️ ⬆️ )

            $table->text('description');
            $table->foreignId('company_id')->constrained('companies');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
