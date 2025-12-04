<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use TmrEcosystem\Maintenance\Domain\Models\MaintenanceRequest;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();

            // (เราจะใช้ Asset Model)
            $table->foreignId('asset_id')->constrained('assets');

            // (เชื่อมโยงกับ HRM Bounded Context)
            $table->foreignId('requested_by_employee_id')
                  ->constrained('employee_profiles'); // (อ้างอิงตารางจาก HRM)

            $table->text('problem_description');
            $table->string('status')->default(MaintenanceRequest::STATUS_PENDING)->index();
            $table->text('rejection_reason')->nullable(); // (เหตุผลที่ปฏิเสธ)

            // (เชื่อมโยงกับ Company ที่แชร์กัน)
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
