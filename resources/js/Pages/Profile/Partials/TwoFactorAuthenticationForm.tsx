import { FormEventHandler, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { PageProps } from '@/types';

type TwoFactorPageProps = PageProps & {
    flash?: { status?: string; qrCodeSvg?: string; recoveryCodes?: string[]; }
};

export default function TwoFactorAuthenticationForm({ className = '' }: { className?: string }) {
    const { props } = usePage<TwoFactorPageProps>();
    const user = props.auth.user;
    const flash = props.flash || {};
    const twoFactorEnabled = user.two_factor_confirmed_at;
    const enabling = flash.status === 'two-factor-enabled';

    const confirmationForm = useForm({ code: '', errorBag: 'confirmTwoFactor' });
    const disableForm = useForm({ password: '', errorBag: 'disableTwoFactor' });
    const enableForm = useForm({});

    const enableTwoFactor: FormEventHandler = (e) => {
        e.preventDefault();
        enableForm.post(route('two-factor.store'), { preserveScroll: true });
    };

    const confirmTwoFactor: FormEventHandler = (e) => {
        e.preventDefault();
        confirmationForm.put(route('two-factor.update'), {
            preserveScroll: true,
            onSuccess: () => { confirmationForm.reset(); },
        });
    };

    const disableTwoFactor: FormEventHandler = (e) => {
        e.preventDefault();
        disableForm.delete(route('two-factor.destroy'), {
            preserveScroll: true,
            onSuccess: () => { disableForm.reset(); },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Two Factor Authentication</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Add additional security to your account using two factor authentication.
                </p>
            </header>

            {/* สถานะ A: เปิดใช้งานแล้ว */}
            {twoFactorEnabled && !enabling && (
                <div className="mt-6 space-y-6">
                    <p className="font-semibold text-green-600">You have enabled 2FA.</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Disable 2FA</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <form onSubmit={disableTwoFactor}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Disable 2FA?</AlertDialogTitle>
                                    <AlertDialogDescription>Please enter your password.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="mt-4">
                                    <Label htmlFor="password_disable_2fa" className="sr-only">Password</Label>
                                    <Input id="password_disable_2fa" type="password"
                                        value={disableForm.data.password}
                                        onChange={(e) => disableForm.setData('password', e.target.value)}
                                        placeholder="Password"
                                    />
                                    <InputError message={disableForm.errors.password} className="mt-2" />
                                </div>
                                <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel type="button" onClick={() => disableForm.reset()}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction type="submit" disabled={disableForm.processing}>Disable</AlertDialogAction>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {/* สถานะ B: ยังไม่ได้เปิด */}
            {!twoFactorEnabled && !enabling && (
                <form onSubmit={enableTwoFactor} className="mt-6">
                    <Button type="submit" disabled={enableForm.processing}>Enable 2FA</Button>
                </form>
            )}

            {/* สถานะ C: กำลังเปิด (รอสแกน/ยืนยัน) */}
            {enabling && (
                <div className="mt-6 space-y-6">
                    <p>Scan the QR code using your authenticator application.</p>
                    <div className="mt-4 w-40 h-40"
                        dangerouslySetInnerHTML={{ __html: flash.qrCodeSvg || '' }}
                    />
                    {flash.recoveryCodes && (
                        <div className="mt-4 space-y-2">
                            <p>Store these recovery codes:</p>
                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-4 font-mono text-sm">
                                {flash.recoveryCodes.map((code) => <div key={code}>{code}</div>)}
                            </div>
                        </div>
                    )}
                    <form onSubmit={confirmTwoFactor}>
                        <div className="space-y-2 max-w-xs">
                            <Label htmlFor="code">Confirmation Code</Label>
                            <Input id="code" value={confirmationForm.data.code}
                                onChange={(e) => confirmationForm.setData('code', e.target.value)}
                                autoComplete="one-time-code"
                            />
                            <InputError message={confirmationForm.errors.code} />
                        </div>
                        <Button className="mt-4" disabled={confirmationForm.processing}>Confirm</Button>
                    </form>
                </div>
            )}
        </section>
    );
}
