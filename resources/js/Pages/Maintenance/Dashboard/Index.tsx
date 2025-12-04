import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';

// (Import Shadcn & Icons)
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import {
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { AlertTriangle, Archive, BarChart3, CalendarClock, ClipboardList, PieChart, Users, Wrench } from 'lucide-react';

interface Props {
    stats: {
        openWorkOrders: number;
        pendingRequests: number;
        totalTechnicians: number;
        totalAssets: number;
        lowStockParts: number;
        activePlans: number;
    };
    statusStats: { name: string; value: number; fill: string }[];
    ratioStats: { name: string; value: number; fill: string }[];
}

export default function MaintenanceDashboardIndex({ auth, stats, statusStats, ratioStats }: PageProps & Props) {

    // (Helper Component สำหรับ Stat Card)
    const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${colorClass}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maintenance Dashboard</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Maintenance Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {/* 1. Work Orders */}
                        <Link href={route('maintenance.work-orders.index', { status: 'open' })}>
                            <StatCard
                                title="งานซ่อมคงค้าง (Open Work Orders)"
                                value={stats.openWorkOrders}
                                icon={Wrench}
                                colorClass="text-blue-600"
                            />
                        </Link>

                        {/* 2. Requests -> ไปหน้า Requests และกรอง status=pending */}
                        <Link href={route('maintenance.requests.index', { status: 'pending' })}>
                            <StatCard
                                title="คำขอแจ้งซ่อมรออนุมัติ (Pending Requests)"
                                value={stats.pendingRequests}
                                icon={ClipboardList}
                                colorClass="text-orange-500"
                            />
                        </Link>

                        {/* 6. Maintenance Plans */}
                        <Link href={route('maintenance.plans.index')}>
                            <StatCard
                                title="แผน PM ที่ใช้งานอยู่ (Active Plans)"
                                value={stats.activePlans}
                                icon={CalendarClock}
                                colorClass="text-purple-600"
                            />
                        </Link>

                        {/* 3. Technicians (หุ้มด้วย Link) */}
                        <Link href={route('maintenance.technicians.index')}>
                            <StatCard
                                title="จำนวนช่าง (Technicians)"
                                value={stats.totalTechnicians}
                                icon={Users}
                                colorClass="text-green-600"
                            />
                        </Link>

                        {/* 4. Assets */}
                        <Link href={route('maintenance.assets.index')}>
                            <StatCard
                                title="ทรัพย์สินทั้งหมด (Active Assets)"
                                value={stats.totalAssets}
                                icon={Archive}
                                colorClass="text-indigo-600"
                            />
                        </Link>

                        {/* 5. Spare Parts -> ไปหน้าอะไหล่ และกรอง filter=low_stock */}
                        <Link href={route('maintenance.spare-parts.index', { filter: 'low_stock' })}>
                            <StatCard
                                title="อะไหล่ใกล้หมด (Low Stock)"
                                value={stats.lowStockParts}
                                icon={AlertTriangle}
                                colorClass="text-red-500"
                            />
                        </Link>

                    </div>

                    {/* (3. [ใหม่] Charts Section) */}
                    <div className="mt-8 grid gap-4 md:grid-cols-2">

                        {/* (Chart 1: Status Breakdown) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-gray-500" />
                                    สถานะงานซ่อม (Status Breakdown)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {statusStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statusStats} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                                {statusStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* (Chart 2: PM vs CM Ratio) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-gray-500" />
                                    สัดส่วนงาน (PM vs CM Ratio)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {ratioStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={ratioStats}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {ratioStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
                                )}
                            </CardContent>
                        </Card>

                    </div>


                </div>
            </div>
        </AuthenticatedLayout>
    );
}
