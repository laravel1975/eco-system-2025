<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Http\Request; // <-- 1. Import Request

class UserActivityListener
{
    /**
     * Create the event listener.
     */
    public function __construct(
        public Request $request // <-- 2. Inject Request (เพื่อดึง IP/User Agent)
    ) {
        //
    }

    /**
     * Handle the event.
     */
    // --- 3. (สำคัญ) แก้ไขเมธอด handle ---
    public function handle(Login | Logout | Failed $event): void
    {
        // 4. กำหนดคำอธิบาย
        $description = match ($event::class) {
            Login::class => 'User logged in successfully',
            Logout::class => 'User logged out',
            Failed::class => 'User failed to log in',
        };

        // 5. (สำคัญ) ดึง User
        // (Event 'Failed' จะมี 'credentials', Event 'Login'/'Logout' จะมี 'user')
        $user = $event->user ?? null;

        // 6. บันทึก Log
        activity()
            ->causedBy($user) // <-- ใคร (ถ้ามี)
            ->withProperties([
                'ip' => $this->request->ip(),
                'user_agent' => $this->request->userAgent(),
                // (ถ้า Login ผิด, ให้บันทึก email ที่พยายาม)
                'email' => $event instanceof Failed ? $event->credentials['email'] : null,
            ])
            ->log($description); // <-- ทำอะไร

        // --- 7. (ต่อยอด) ระบบแจ้งเตือน (ข้อ 5.4) ---
        if ($event instanceof Failed) {
            // (เราสามารถเพิ่ม Logic ส่ง Email แจ้งเตือน Admin ที่นี่)
            // Mail::to('admin@tmr.dev')->send(new SuspiciousLoginAttempt($event->credentials['email']));
        }
    }
}
