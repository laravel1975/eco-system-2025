import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// (Import Shadcn)
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { MaintenancePlan, PaginatedResponse } from '@/types/maintenance';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/

interface Props {
    plans: PaginatedResponse<MaintenancePlan>;
}

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function MaintenancePlanIndex({ auth, plans }: PageProps & Props) {

    // (2. เพิ่ม State และ Form สำหรับจัดการการลบ)
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<MaintenancePlan | null>(null);
    const { delete: destroy, processing } = useForm();

    // (Helper: Format วันที่)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    /**
     * เปิด Modal และเก็บ Plan ที่จะลบ
     */
    const openDeleteModal = (plan: MaintenancePlan) => {
        setPlanToDelete(plan);
        setConfirmingDeletion(true);
    };

    /**
     * ปิด Modal
     */
    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setPlanToDelete(null);
    };

    /**
     * ยืนยันการลบ (ส่ง Form)
     */
    const handleDelete = () => {
        if (!planToDelete) return;

        destroy(route('maintenance.plans.destroy', planToDelete.id), {
            onSuccess: () => closeDeleteModal(),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maintenance Plans</h2>}
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="แผน PM" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="flex justify-end mb-4">
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href={route('maintenance.plans.create')}>
                                + สร้างแผน PM ใหม่
                            </Link>
                        </Button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ชื่อแผน</TableHead>
                                    <TableHead>ทรัพย์สิน (Asset)</TableHead>
                                    <TableHead>ความถี่</TableHead>
                                    <TableHead>ครั้งถัดไป</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead className='text-end'>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                            ไม่พบข้อมูลแผน PM
                                        </TableCell>
                                    </TableRow>
                                )}
                                {plans.data.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.title}</TableCell>
                                        <TableCell>{plan.asset.name}</TableCell>
                                        <TableCell>ทุก {plan.interval_days} วัน</TableCell>
                                        <TableCell>{formatDate(plan.next_due_date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={plan.status === 'active' ? 'default' : 'outline'}>
                                                {plan.status}
                                            </Badge>
                                        </TableCell>
                                        {/* ( 5. [ปรับปรุงใหม่] นี่คือ Dropdown Menu ที่คุณขอ) */}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('maintenance.plans.show', plan.id)}>
                                                            View (ดูรายละเอียด)
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('maintenance.plans.edit', plan.id)}>
                                                            Edit (แก้ไข)
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => openDeleteModal(plan)} // (เรียก Modal)
                                                    >
                                                        Delete (ลบ)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* (เพิ่ม Pagination ที่นี่ถ้าต้องการ) */}
                </div>
            </div>

            {/* (6. [ใหม่] Modal ยืนยันการลบ) */}
            <AlertDialog open={confirmingDeletion} onOpenChange={setConfirmingDeletion}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการลบแผน PM นี้: "{planToDelete?.title}"?
                            การกระทำนี้ไม่สามารถกู้คืนได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDeleteModal}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
