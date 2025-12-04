<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('barcode')->nullable()->index()->after('part_number');
            $table->boolean('is_active')->default(true)->after('description');
            $table->string('type')->default('product')->comment('product, consu, service');
            $table->boolean('can_purchase')->default(true);
            $table->boolean('can_sell')->default(true);
            // (Tracking, Image, Taxes - ละไว้ก่อนเพื่อความกระชับ)
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'is_active', 'type', 'can_purchase', 'can_sell']);
        });
    }
};
