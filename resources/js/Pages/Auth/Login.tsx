import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    // --- 2. สร้าง State สำหรับนับถอยหลัง ---
    const [countdown, setCountdown] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    // --- 3. (สำคัญ) Effect นี้ใช้ "เริ่ม" นับถอยหลัง ---
    // มันจะทำงานเมื่อ 'errors.email' เปลี่ยนแปลง
    useEffect(() => {
        const emailError = errors.email;
        // ตรวจสอบว่าใช่ Error "Too many login attempts" หรือไม่
        if (emailError && emailError.includes('Too many login attempts')) {
            // ดึงตัวเลขวินาที (เช่น 45) ออกจาก String
            const secondsMatch = emailError.match(/(\d+)/);
            if (secondsMatch) {
                const seconds = parseInt(secondsMatch[0], 10);
                // ตั้งค่า State ให้นับถอยหลัง
                setCountdown(seconds);
            }
        }
    }, [errors.email]); // <-- ดูการเปลี่ยนแปลงที่นี่

    // --- 4. (สำคัญ) Effect นี้ใช้ "นับถอยหลัง" (Tick) ---
    // มันจะทำงานเมื่อ 'countdown' (State) มีค่ามากกว่า 0
    useEffect(() => {
        if (countdown > 0) {
            // สร้าง Timer ที่ทำงานทุก 1 วินาที
            const timerId = setInterval(() => {
                setCountdown((prevSeconds) => prevSeconds - 1);
            }, 1000);

            // Cleanup: ลบ Timer เมื่อ Component หายไป หรือ countdown จบ
            return () => clearInterval(timerId);
        }
    }, [countdown]); // <-- ดูการเปลี่ยนแปลงที่นี่

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    // --- 5. (ใหม่) สร้างข้อความ Error แบบไดนามิก ---
    let emailErrorMessage = errors.email;
    if (countdown > 0) {
        // สร้างข้อความใหม่โดยใช้ State ที่นับถอยหลัง
        emailErrorMessage = `Too many login attempts. Please try again in ${countdown} seconds.`;
    }

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {/* 6. แสดง Error แบบไดนามิก */}
                    <InputError message={emailErrorMessage} />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
