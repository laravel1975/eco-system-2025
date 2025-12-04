import { FormEventHandler, useState } from 'react';
import { useForm } from '@inertiajs/react';

// --- Imports ที่เปลี่ยน/เพิ่มเข้ามา (ShadCN) ---
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger, // <-- 1. เราจะใช้ Trigger
} from '@/Components/ui/alert-dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError'; // (ตัวนี้ใช้ของ Breeze ได้)
import { Monitor, Smartphone } from 'lucide-react'; // <-- 2. Import Icons
import { Button } from '@/components/ui/button';

// 1. สร้าง Type สำหรับ Prop ที่ Controller ส่งมา
type Session = {
    agent: { is_desktop: boolean; platform: string; browser: string };
    ip_address: string;
    is_current_device: boolean;
    last_active: string;
};

// 2. รับ 'sessions' prop
export default function LogoutOtherBrowserSessionsForm({
    sessions,
    className = '',
}: {
    sessions: Session[];
    className?: string;
}) {
    // 3. (สำคัญ) เราจะไม่ใช้ state 'confirmingLogout'
    // เพราะ AlertDialog ของ ShadCN จัดการ open/close state เอง

    // 4. ตั้งค่า useForm (สำคัญ: ต้องระบุ errorBag)
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        password: '',
        errorBag: 'logoutOtherBrowserSessions',
    });

    // 5. ฟังก์ชัน Submit (เมื่อกดยืนยันใน Modal)
    const logoutOtherBrowserSessions: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.logout-other-sessions'), {
            preserveScroll: true,
            onSuccess: () => {
                // (AlertDialog จะปิดตัวเองอัตโนมัติ)
                clearErrors();
                reset();
            },
            onError: () => {
                // (Modal จะยังเปิดอยู่ ให้ user แก้ password)
            },
            onFinish: () => {
                // (ถ้าไม่ Success, เราจะไม่ reset field)
            },
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                {/* (Header ไม่ได้แก้ไข) */}
                <h2 className="text-lg font-medium text-gray-900">
                    Browser Sessions
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Manage and log out your active sessions on other browsers and
                    devices.
                </p>
            </header>

            {/* 6. ส่วนแสดงผลรายการ Sessions (เพิ่ม Icons) */}
            <div className="mt-6 max-w-xl text-sm text-gray-600">
                {sessions.length > 0 ? (
                    <ul className="space-y-4">
                        {sessions.map((session, i) => (
                            <li key={i} className="flex items-center">
                                <div>
                                    {session.agent.is_desktop ? (
                                        <Monitor className="h-6 w-6 text-gray-500" />
                                    ) : (
                                        <Smartphone className="h-6 w-6 text-gray-500" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm text-gray-900">
                                        {session.agent.platform} – {session.agent.browser}
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            {session.ip_address},
                                            {session.is_current_device ? (
                                                <span className="ml-1 font-semibold text-green-500">
                                                    This device
                                                </span>
                                            ) : (
                                                <span className="ml-1">
                                                    Last active {session.last_active}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No active sessions found.</p>
                )}
            </div>

            {/* 7. Modal ยืนยัน (เปลี่ยนเป็น ShadCN ทั้งหมด) */}
            <AlertDialog>
                {/* ปุ่มเปิด Modal (เปลี่ยนเป็น ShadCN) */}
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        disabled={sessions.length <= 1 || processing}
                    >
                        Log Out Other Browser Sessions
                    </Button>
                </AlertDialogTrigger>

                {/* เนื้อหา Modal */}
                <AlertDialogContent>
                    <form onSubmit={logoutOtherBrowserSessions}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Log out other browser sessions?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Please enter your password to confirm you would like to
                                log out of your other browser sessions.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        {/* ฟอร์ม Password (ShadCN) */}
                        <div className="mt-4">
                            <Label
                                htmlFor="password_logout_sessions"
                                className="sr-only"
                            >
                                Password
                            </Label>
                            <Input
                                id="password_logout_sessions"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1 block w-full"
                                placeholder="Password"
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* ปุ่ม Footer (ShadCN) */}
                        <AlertDialogFooter className="mt-6">
                            {/* AlertDialogCancel จะจัดการปิด Modal อัตโนมัติ */}
                            <AlertDialogCancel type="button" onClick={() => reset()}>
                                Cancel
                            </AlertDialogCancel>
                            {/* AlertDialogAction คือปุ่มยืนยัน */}
                            <AlertDialogAction type="submit" disabled={processing}>
                                {processing ? 'Logging Out...' : 'Log Out'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
