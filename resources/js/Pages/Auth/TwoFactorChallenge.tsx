import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors, reset } = useForm({ code: '' });
    useEffect(() => { return () => { reset('code'); }; }, []);
    const submit = (e: React.FormEvent) => { e.preventDefault(); post(route('two-factor.login')); };

    return (
        <GuestLayout>
            <Head title="Two-Factor Challenge" />
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Please enter the 6-digit code from your authenticator app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Authentication Code</Label>
                                <Input id="code" type="text" inputMode="numeric" autoFocus
                                    autoComplete="one-time-code" value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                />
                                <InputError message={errors.code} />
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Verifying...' : 'Log In'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
