import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/Components/ui/card';
import { EmployeeForm } from './Partials/EmployeeForm';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- 1. สร้าง Type ที่ถูกต้องสำหรับข้อมูลของเรา ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department { id: number; name: string; company_id: number; }
interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string | null;
    user: { id: number; name: string; email: string } | null;
    department: Department | null;
    company?: Company | null;
    join_date?: string;
}
interface AuthUser extends User {
    company: Company;
}

// (Interface หลักของหน้า)
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    employees: {
        data: Employee[];
        links: any[];
    };
    commonData: {
        departments: Department[];
        unlinkedUsers: User[];
        companies: Company[];
    };
    query: {
        action?: 'create' | 'edit';
        link_user_id?: number;
        id?: number;
    };
}

// --- (Component หลัก: EmployeeIndex) ---
export default function EmployeeIndex({ auth, employees, commonData, query, employeeToEdit }: IndexPageProps) {

    const [modalState, setModalState] = useState<'create' | 'closed'>('closed');
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
    const [linkedUserId, setLinkedUserId] = useState<number | undefined>();

    const { delete: inertiaDelete, processing: deleting } = useForm();

    // (4. แก้ไข Wizard Logic)
    useEffect(() => {
        if (query.action === 'create') {
            setLinkedUserId(query.link_user_id);
            setModalState('create');
        }
    }, [query]);

    // (5. แก้ไข Close Modal)
    const closeModal = () => {
        setModalState('closed');
        setLinkedUserId(undefined);
        router.visit(route('hrm.employees.index'), { preserveState: true });
    };

    // (Delete Logic)
    const submitDelete = () => {
        if (!deletingEmployee) return;
        inertiaDelete(route('hrm.employees.destroy', deletingEmployee.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingEmployee(null),
            onError: () => setDeletingEmployee(null),
        });
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Employee Management
                    </h2>
                    <Button onClick={() => setModalState('create')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Employee
                    </Button>
                </div>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Employees" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                {/* (TableHeader - เหมือนเดิม) */}
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Linked User (IAM)</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.data.map((emp) => (
                                        <TableRow key={emp.id}>
                                            {/* (TableCells - เหมือนเดิม) */}
                                            <TableCell>{emp.first_name} {emp.last_name}</TableCell>
                                            <TableCell>{emp.job_title ?? 'N/A'}</TableCell>
                                            <TableCell>{emp.department?.name ?? 'N/A'}</TableCell>
                                            <TableCell>{emp.user?.name ?? <span className="text-gray-400">Not Linked</span>}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {/* --- (6. แก้ไข) --- */}
                                                        {/* เปลี่ยน "Edit" ให้เป็น <Link> */}
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('hrm.employees.edit', emp.id)}>
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {/* --- (สิ้นสุดการแก้ไข) --- */}

                                                        <DropdownMenuItem onClick={() => setDeletingEmployee(emp)} className="text-red-600">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Pagination links={employees.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (7. แก้ไข Modal: Create - ลบ Modal Edit) */}
            <Dialog open={modalState === 'create'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Employee</DialogTitle>
                    </DialogHeader>
                    {/* (เรียกใช้ EmployeeForm ที่ Import มา) */}
                    <EmployeeForm
                        commonData={commonData}
                        linkedUserId={linkedUserId}
                        onSuccessCallback={closeModal} // (เมื่อสร้างสำเร็จ ให้ปิด Modal)
                        auth={auth}
                    />
                </DialogContent>
            </Dialog>

            {/* (Modal: Delete - เหมือนเดิม) */}
            <AlertDialog open={!!deletingEmployee} onOpenChange={(open) => !open && setDeletingEmployee(null)}>
                <AlertDialogContent>
                    {deletingEmployee ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingEmployee.first_name}?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingEmployee(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={submitDelete} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </Button>
                            </AlertDialogFooter>
                        </>
                    ) : null}
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
