import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

// --- 1. (Imports ใหม่) ---
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Users, Building, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

// --- 2. (Imports Helper) ---
// (เราจะใช้ Helper 2 ตัวนี้จากหน้า Audit Log)
function renderCauser(log: ActivityLog) {
    if (log.causer) return log.causer.name;
    return <span className="text-gray-400">System/Unknown</span>;
}
function renderSubject(log: ActivityLog) {
    if (!log.subject_type) return 'N/A';
    return `${log.subject_type.split('\\').pop()}`;
}

// --- 1. (สำคัญ) แก้ไข Interface นี้ ---
// (เปลี่ยนจาก 'StatProps' เป็น 'DashboardPageProps' และ 'extends PageProps')
interface DashboardPageProps extends PageProps {
    stats: {
        users: number;
        companies: number;
        roles: number;
        failedLogins: number;
    };
    recentActivity: ActivityLog[];
}
interface ActivityLog {
    id: number;
    description: string;
    causer: { id: number; name: string } | null;
    subject_type: string | null;
    created_at: string;
}
// --- สิ้นสุดการแก้ไข Interface ---

export default function Dashboard({ auth, stats, recentActivity }: DashboardPageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* --- 4. (ใหม่) Stat Cards --- */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.users}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.companies}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.roles}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.failedLogins}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- 5. (ใหม่) Recent Activity Widget --- */}
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentActivity.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{renderCauser(log)}</TableCell>
                                                <TableCell>{log.description}</TableCell>
                                                <TableCell>{renderSubject(log)}</TableCell>
                                                <TableCell>
                                                    {new Date(log.created_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
