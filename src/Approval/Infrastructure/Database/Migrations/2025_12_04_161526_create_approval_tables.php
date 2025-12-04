<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Workflow Definition (แม่แบบ)
        Schema::create('approval_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // e.g., 'PR_FLOW', 'LEAVE_FLOW'
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Workflow Steps (ขั้นตอน)
        Schema::create('approval_workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('approval_workflows')->cascadeOnDelete();
            $table->integer('order')->default(1);
            $table->string('approver_role')->nullable(); // e.g. 'Manager', 'Director'
            $table->json('conditions')->nullable(); // e.g. {"amount": {">": 5000}}
            $table->timestamps();
        });

        // 3. Requests (รายการคำขอจริง)
        Schema::create('approval_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('workflow_id')->constrained('approval_workflows');
            $table->foreignId('requester_id'); // User ID (BigInt)

            // Polymorphic (รองรับทั้ง UUID และ ID ปกติ)
            $table->string('subject_type');
            $table->string('subject_id', 36); // ใช้ String 36 chars เพื่อรับทั้ง UUID และ Int
            $table->index(['subject_type', 'subject_id']);

            $table->string('status')->default('pending')->index();
            $table->integer('current_step_order')->default(1);
            $table->timestamps();
        });

        // 4. Actions / Audit Log
        Schema::create('approval_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('approval_request_id')->constrained('approval_requests')->cascadeOnDelete();
            $table->foreignId('actor_id'); // User ID คนกดอนุมัติ
            $table->string('action'); // approve, reject, comment, return
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_actions');
        Schema::dropIfExists('approval_requests');
        Schema::dropIfExists('approval_workflow_steps');
        Schema::dropIfExists('approval_workflows');
    }
};
