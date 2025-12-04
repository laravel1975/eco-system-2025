<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_code');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('model_number')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_end_date')->nullable();

            $table->string('status')->default('active')
                  ->comment('e.g., active, inactive, in_repair, decommissioned');

            $table->foreignId('company_id')->constrained('companies');

            $table->timestamps();

            $table->unique(['company_id', 'asset_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
