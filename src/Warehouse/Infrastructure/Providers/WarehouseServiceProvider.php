<?php

namespace TmrEcosystem\Warehouse\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use TmrEcosystem\Warehouse\Domain\Repositories\StorageLocationRepositoryInterface;
// (1) Import Interface (Domain)
use TmrEcosystem\Warehouse\Domain\Repositories\WarehouseRepositoryInterface;
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Repositories\EloquentStorageLocationRepository;
// (2) Import Implementation (Infrastructure)
use TmrEcosystem\Warehouse\Infrastructure\Persistence\Eloquent\Repositories\EloquentWarehouseRepository;

class WarehouseServiceProvider extends ServiceProvider
{
    /**
     * (3) ลงทะเบียนการ "Bind"
     * (บอก Laravel ว่าถ้ามีคนขอ Interface ให้ส่ง คลาส นี้ไป)
     */
    public function register(): void
    {
        $this->app->bind(
            WarehouseRepositoryInterface::class,
            EloquentWarehouseRepository::class
        );

        $this->app->bind(
            StorageLocationRepositoryInterface::class,
            EloquentStorageLocationRepository::class
        );
    }

    /**
     * (4) "Boot" Bounded Context
     */
    public function boot(): void
    {
        // (4A) บอก Laravel ให้โหลด Migrations จากที่นี่
        $this->loadMigrationsFrom(
            __DIR__ . '/../Persistence/database/migrations'
        );

        // (4B) เรียกฟังก์ชันโหลด Routes (ที่เราจะสร้างในขั้นถัดไป)
        $this->bootRoutes();
    }

    /**
     * (5) ฟังก์ชันสำหรับโหลด Routes
     * (เราจะใช้ใน Presentation Layer)
     */
    protected function bootRoutes(): void
    {
        // (กำหนด Path ของไฟล์ Route)
        $webRoutePath = __DIR__ . '/../../Presentation/Http/routes/warehouse.php';

        // (ครอบ Route ด้วย Middleware 'web', 'auth', 'verified')
        Route::middleware(['web', 'auth', 'verified'])
            ->prefix('warehouses') // (ใส่ /warehouses ให้อัตโนมัติ)
            ->name('warehouses.') // (ใส่ warehouses. ให้อัตโนมัติ)
            ->group(function () use ($webRoutePath) {
                // (ถ้าไฟล์นี้มีอยู่จริง)
                if (file_exists($webRoutePath)) {
                    require $webRoutePath; // (โหลดไฟล์ Route)
                }
            });
    }
}
