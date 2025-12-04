import { FormEventHandler } from 'react';
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
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError'; // (ตัวนี้ใช้ของ Breeze ได้)


export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    // (เราไม่ต้องใช้ useState และ useRef ที่นี่)

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                // (AlertDialog จะปิดตัวเอง)
                clearErrors();
                reset();
            },
            onError: () => {
                // (AlertDialog จะยังเปิดอยู่)
            },
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted.
                </p>
            </header>

            {/* 1. เปลี่ยน Modal ทั้งหมดเป็น ShadCN AlertDialog */}
            <AlertDialog>
                {/* 2. เปลี่ยน DangerButton (Trigger) */}
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <form onSubmit={deleteUser}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you sure you want to delete your account?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Once your account is deleted, all of its resources
                                and data will be permanently deleted. Please
                                enter your password to confirm.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        {/* 3. เปลี่ยนฟอร์ม Password (ShadCN) */}
                        <div className="mt-4">
                            <Label htmlFor="password_delete" className="sr-only">
                                Password
                            </Label>
                            <Input
                                id="password_delete"
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

                        {/* 4. เปลี่ยนปุ่ม Footer (ShadCN) */}
                        <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel type="button" onClick={() => reset()}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction type="submit" disabled={processing}>
                                {processing ? 'Deleting...' : 'Delete Account'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
