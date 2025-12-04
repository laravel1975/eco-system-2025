import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

// --- (Imports ของ ShadCN) ---
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {

    // 1. ตั้งค่า useForm (มีแค่ 'email')
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    // 2. ฟังก์ชัน Submit
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // (ส่งไปที่ Route ที่ Breeze สร้างไว้)
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>
                        No problem. Just let us know your email address and we will
                        email you a password reset link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 3. แสดงข้อความ Success (ถ้ามี) */}
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    autoFocus
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Sending...' : 'Email Password Reset Link'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
