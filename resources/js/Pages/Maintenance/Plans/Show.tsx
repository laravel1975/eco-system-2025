import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';

// (Import Shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { CheckSquare } from 'lucide-react'; // (2. [ใหม่] Import Icon)
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/
interface Asset { id: number; name: string; asset_code: string; }
interface MaintenanceType { id: number; name: string; }

// (3. [ใหม่] เพิ่ม Type สำหรับ Task)
interface PlanTask {
    id: number;
    task_name: string;
    description: string | null;
}

interface MaintenancePlan {
    id: number;
    title: string;
    asset_id: number;
    maintenance_type_id: number;
    interval_days: number;
    next_due_date: string;
    status: 'active' | 'inactive';
    asset: Asset; // (Loaded relation)
    maintenance_type: MaintenanceType; // (Loaded relation)
    tasks: PlanTask[]; // (4. [ใหม่] เพิ่ม tasks array)
}

interface Props {
    plan: MaintenancePlan;
}

// (Helper: Format วันที่)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
};

// (Helper: Detail Item)
const DetailItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{children || '-'}</dd>
    </div>
);

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function ShowMaintenancePlan({ auth, plan }: PageProps & Props) {

    return (
        <AuthenticatedLayout
                    user={auth.user}
                    header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายละเอียดแผน PM</h2>}
                    // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
                    navigationMenu={<MaintenanceNavigationMenu />}
                >
            <Head title={plan.title} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">

                    <Breadcrumbs
                        links={[ { label: "แผน PM", href: route('maintenance.plans.index') } ]}
                        activeLabel={plan.title}
                    />

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{plan.title}</CardTitle>
                                <Badge variant={plan.status === 'active' ? 'default' : 'outline'} className="mt-2">
                                    {plan.status}
                                </Badge>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={route('maintenance.plans.edit', plan.id)}>
                                    แก้ไข
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="ทรัพย์สิน (Asset)">
                                    <Link href={route('maintenance.assets.show', plan.asset.id)} className="text-indigo-600 hover:underline">
                                        {plan.asset.asset_code} - {plan.asset.name}
                                    </Link>
                                </DetailItem>
                                <DetailItem label="ประเภทงาน PM">
                                    {plan.maintenance_type.name}
                                </DetailItem>
                                <DetailItem label="ความถี่">
                                    ทุก {plan.interval_days} วัน
                                </DetailItem>
                                <DetailItem label="ครั้งถัดไป">
                                    {formatDate(plan.next_due_date)}
                                </DetailItem>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* (5. [ใหม่] Card สำหรับแสดง Checklist) */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5" />
                                รายการตรวจสอบ (Checklist)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {plan.tasks.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    (ไม่มียการตรวจสอบที่กำหนด)
                                </p>
                            ) : (
                                <ol className="list-decimal list-outside space-y-4 pl-5">
                                    {plan.tasks.map((task) => (
                                        <li key={task.id} className="text-sm">
                                            <strong className="block font-medium text-gray-900">{task.task_name}</strong>
                                            {task.description && (
                                                <p className="text-gray-600">{task.description}</p>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </CardContent>
                    </Card>

                    {/* (ส่วนประวัติ - เราจะทำทีหลัง) */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>ประวัติ Work Order ที่สร้างจากแผนนี้</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 text-center py-4">
                                (ยังไม่มีประวัติ)
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
