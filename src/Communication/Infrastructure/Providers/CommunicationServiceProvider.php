<?php

namespace TmrEcosystem\Communication\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class CommunicationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // โหลด Migrations จากโฟลเดอร์ปัจจุบัน
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        // เดี๋ยวเราจะมาเพิ่ม loadRoutes ตรงนี้ในขั้นตอนถัดไป
       $this->bootRoutes();
    }

    /**
     * 👈 3. สร้างฟังก์ชันนี้ขึ้นมาเพื่อจัดการ Route โดยเฉพาะ
     */
    protected function bootRoutes(): void
    {
        // --- สำหรับ Web Routes ---
        // $webRoutePath = __DIR__ . '/../../Presentation/Http/routes/sales.php';

        // Route::middleware(['web', 'auth', 'verified']) // 👈 นี่คือจุดสำคัญ!
        //     ->prefix('sales')                   // กำหนด prefix
        //     ->name('sales.')                      // กำหนด name prefix
        //     ->group(function () use ($webRoutePath) {
        //         require $webRoutePath; // โหลดไฟล์ Route ที่เราสร้างไว้
        //     });

        // --- (Optional) สำหรับ API Routes (ถ้ามี) ---
        $apiRoutePath = __DIR__ . '/../../Presentation/Http/routes/api.php';

        Route::middleware('api') // 👈 ใช้ middleware 'api'
            ->prefix('api/communication')
            ->name('api.communication.')
            ->group(function () use ($apiRoutePath) {
                if (file_exists($apiRoutePath)) {
                    require $apiRoutePath;
                }
            });
    }
}
