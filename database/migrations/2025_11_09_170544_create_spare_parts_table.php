<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('part_number');
            $table->text('description')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->integer('reorder_level')->nullable()->comment('จุดสั่งซื้อขั้นต่ำ');
            $table->string('location')->nullable()->comment('ที่จัดเก็บ');

            $table->foreignId('company_id')->constrained('companies');

            $table->timestamps();

            $table->unique(['company_id', 'part_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spare_parts');
    }
};
