<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

// --- Imports ที่เพิ่มเข้ามา ---
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Jenssegers\Agent\Agent; // <-- ต้องติดตั้ง 'jenssegers/agent'

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // --- 1. เพิ่ม Logic การดึง Sessions ---
        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->latest('last_activity')
            ->get()
            ->map(function ($session) use ($request) {
                $agent = $this->createAgent($session);
                return (object) [
                    'agent' => [
                        'is_desktop' => $agent->isDesktop(),
                        'platform' => $agent->platform() ?: 'Unknown',
                        'browser' => $agent->browser() ?: 'Unknown',
                    ],
                    'ip_address' => $session->ip_address,
                    'is_current_device' => $session->id === $request->session()->getId(),
                    'last_active' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                ];
            });
        // --- สิ้นสุดส่วนที่เพิ่ม ---

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'sessions' => $sessions, // <-- 2. ส่ง sessions ไปให้ View
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Logout other browser sessions.
     */
    // --- 3. เพิ่มเมธอดใหม่นี้ทั้งหมด ---
    public function logoutOtherBrowserSessions(Request $request): RedirectResponse
    {
        // 1. ตรวจสอบรหัสผ่านปัจจุบัน
        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => __('This password does not match our records.'),
            ])->errorBag('logoutOtherBrowserSessions'); // <-- ส่ง Error Bag ไปให้ฟอร์ม
        }

        // 2. ลบ Session อื่นๆ
        if ($request->user()->currentAccessToken()) {
            $request->user()->tokens()->delete();
        }

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId()) // <-- ไม่ลบ Session ปัจจุบัน
            ->delete();

        return back(303);
    }

    /**
     * Create a new agent instance from the given session.
     */
    // --- 4. เพิ่ม Helper Method นี้ ---
    protected function createAgent($session)
    {
        $agent = new Agent();
        if ($session->user_agent) {
            $agent->setUserAgent($session->user_agent);
        }
        return $agent;
    }
}
