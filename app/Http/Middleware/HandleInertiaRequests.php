<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;
use TmrEcosystem\HRM\Domain\Models\Attendance;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // (ฟังก์ชันสำหรับดึงสถานะ)
        $attendanceStatus = function () use ($request) {
            if (!$request->user() || !$request->user()->profile) {
                return null;
            }

            $attendance = Attendance::where('employee_profile_id', $request->user()->profile->id)
                ->where('date', Carbon::today()->toDateString())
                ->first();

            if (!$attendance) {
                return 'absent'; // (ยังไม่ Clock In)
            }
            if ($attendance->clock_in && !$attendance->clock_out) {
                return 'clocked_in'; // (Clock In แล้ว แต่ยังไม่ Clock Out)
            }
            if ($attendance->clock_in && $attendance->clock_out) {
                return 'clocked_out'; // (Clock Out แล้ว)
            }
            return 'absent';
        };

        // if ($request->user()) {
        //     dd($request->user()->load('profile'));
        // }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('profile') : null, // (โหลด profile มาด้วย)
                'attendanceStatus' => $attendanceStatus, // (ส่งสถานะไปให้ React)
            ],
            'flash' => fn() => [
                'success' => $request->session()->get('success'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'error' => $request->session()->get('error'),
                'status' => $request->session()->get('status'),
                'qrCodeSvg' => $request->session()->get('qrCodeSvg'),
                'recoveryCodes' => $request->session()->get('recoveryCodes'),
            ],

        ];
    }
}
