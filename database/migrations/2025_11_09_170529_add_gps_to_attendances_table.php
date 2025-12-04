<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // (พิกัดตอน Clock In)
            $table->decimal('clock_in_latitude', 10, 8)->nullable()->after('clock_out');
            $table->decimal('clock_in_longitude', 11, 8)->nullable()->after('clock_in_latitude');

            // (พิกัดตอน Clock Out)
            $table->decimal('clock_out_latitude', 10, 8)->nullable()->after('clock_in_longitude');
            $table->decimal('clock_out_longitude', 11, 8)->nullable()->after('clock_out_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'clock_in_latitude',
                'clock_in_longitude',
                'clock_out_latitude',
                'clock_out_longitude'
            ]);
        });
    }
};
