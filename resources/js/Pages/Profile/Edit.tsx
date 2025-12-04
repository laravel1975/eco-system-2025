import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import LogoutOtherBrowserSessionsForm from './Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from './Partials/TwoFactorAuthenticationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

type Session = {
    agent: { is_desktop: boolean; platform: string; browser: string };
    ip_address: string;
    is_current_device: boolean;
    last_active: string;
};

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
    sessions,
}: PageProps<{ mustVerifyEmail: boolean; status?: string; sessions: Session[] }>) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Two Factor Authentication</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TwoFactorAuthenticationForm className="max-w-xl" />
                        </CardContent>
                    </Card>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* --- Card สำหรับ Sessions --- */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <LogoutOtherBrowserSessionsForm
                            sessions={sessions} // <-- 6. ส่ง prop ลงไป
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
