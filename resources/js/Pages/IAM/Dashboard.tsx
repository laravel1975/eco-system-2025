import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // (1. ใช้ Layout ที่ถูกต้อง)

import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card'; // (สำหรับ Stats)
import { HardHat, Archive, Wrench } from 'lucide-react'; // (สำหรับ Stats)
import IamNavigationMenu from './Partials/IamNavigationMenu';


/*
|--------------------------------------------------------------------------
| 4. หน้า Dashboard ของ Maintenance
|--------------------------------------------------------------------------
*/
export default function IamDashboardIndex({ auth }: PageProps) {

    // (เราสามารถเพิ่ม Props 'stats' ได้ในอนาคต เหมือน Dashboard หลัก)

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">IAM Dashboard</h2>}
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<IamNavigationMenu />}
        >
            <Head title="Identity Authentication Managements Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* (เพิ่ม Stat Cards ของ Maintenance ที่นี่) */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <HardHat className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">240</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                                <Archive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Access Permissions</CardTitle>
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">126</div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
