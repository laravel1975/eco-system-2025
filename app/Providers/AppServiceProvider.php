<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
// --- 1. (สำคัญ) Import Password ---
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // --- 2. (สำคัญ) เพิ่ม Logic นี้ ---
        // นี่คือการ "กำหนดนโยบายรหัสผ่าน" (Password Policy)
        Password::defaults(function () {

            // 2.1 กำหนดกฎ
            $rule = Password::min(10) // 1. ต้องมีอย่างน้อย 10 ตัวอักษร
                            ->mixedCase()   // 2. ต้องมีตัวพิมพ์เล็กและใหญ่
                            ->numbers()     // 3. ต้องมีตัวเลข
                            ->symbols()     // 4. ต้องมีสัญลักษณ์ (เช่น @, $, !)
                            ->uncompromised(); // 5. (ขั้นสูง) ต้องไม่เป็นรหัสผ่านที่เคยรั่วไหล (เช็กกับ API)

            // 2.2 คืนค่ากฎนี้
            return $rule;
        });
        // --- สิ้นสุดการเพิ่ม ---
    }
}
