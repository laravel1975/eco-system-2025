import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
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
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- (1. แก้ไข Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department {
    id: number;
    name: string;
    description: string | null;
    company_id: number;
    parent_id: number | null;
    company?: Company | null;
    parent?: Department | null;
}
// (แก้ไข AuthUser ให้อนุญาต null)
interface AuthUser extends User {
    company: Company | null; // <-- (แก้ไข)
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    departments: {
        data: Department[];
        links: any[];
    };
    commonData: {
        departments: Department[];
        companies: Company[];
    };
}

// --- (Component ย่อย: DepartmentForm) ---
function DepartmentForm({ department, commonData, auth, onClose }: {
    department?: Department,
    commonData: IndexPageProps['commonData'],
    auth: IndexPageProps['auth'],
    onClose: () => void
}) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: department?.name || '',
        description: department?.description || '',
        // (แก้ไข) เพิ่มการตรวจสอบ auth.user.company_id
        company_id: String(department?.company_id || (isSuperAdmin ? '' : (auth.user.company_id || ''))),
        parent_id: String(department?.parent_id || ''),
    });

    // (Logic กรองแผนกแม่ - เหมือนเดิม)
    const filteredParents = useMemo(() => {
        if (!data.company_id) return [];
        let parents = commonData.departments.filter(
            (d) => d.company_id === parseInt(data.company_id, 10)
        );
        if (department) {
            parents = parents.filter((d) => d.id !== department.id);
        }
        return parents;
    }, [data.company_id, commonData.departments, department]);

    // (handleSubmit - เหมือนเดิม)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (department) {
            patch(route('hrm.departments.update', department.id), {
                onSuccess: () => { reset(); onClose(); },
                preserveScroll: true,
            });
        } else {
            post(route('hrm.departments.store'), {
                onSuccess: () => { reset(); onClose(); },
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (Dropdown Company) */}
            <div className="space-y-2">
                <Label htmlFor="company_id">Company</Label>
                <Select
                    onValueChange={(value) => {
                        setData('company_id', value);
                        setData('parent_id', '');
                    }}
                    value={data.company_id}
                    disabled={!isSuperAdmin}
                >
                    <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                    <SelectContent>
                        {/* --- (2. แก้ไข) เพิ่ม Guard Clause `&& auth.user.company` --- */}
                        {!isSuperAdmin && auth.user.company ? (
                            <SelectItem
                                key={auth.user.company.id} // (นี่คือบรรทัด ~116)
                                value={String(auth.user.company.id)}
                            >
                                {auth.user.company.name}
                            </SelectItem>
                        ) : (
                            commonData.companies.map((company) => (
                                <SelectItem key={company.id} value={String(company.id)}>{company.name}</SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                <InputError message={errors.company_id} />
            </div>

            {/* (Dropdown Parent Department - เหมือนเดิม) */}
            <div className="space-y-2">
                <Label htmlFor="parent_id">Parent Department (Optional)</Label>
                <Select
                    onValueChange={(value) => setData('parent_id', value === 'no_parent' ? '' : value)}
                    value={data.parent_id || 'no_parent'}
                    disabled={!data.company_id}
                >
                    <SelectTrigger><SelectValue placeholder="Select a parent department" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="no_parent">-- No Parent --</SelectItem>
                        {filteredParents.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.parent_id} />
            </div>

            {/* (Name & Description - เหมือนเดิม) */}
            <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                <InputError message={errors.name} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" value={data.description || ''} onChange={(e) => setData('description', e.target.value)} />
                <InputError message={errors.description} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// --- (Component หลัก: Index - ไม่ต้องแก้ไข) ---
export default function DepartmentIndex({ auth, departments, commonData }: IndexPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | undefined>();
    const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

    const { delete: inertiaDelete, processing: deleting } = useForm();
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const submitDelete = () => {
        if (!deletingDepartment) return;
        inertiaDelete(route('hrm.departments.destroy', deletingDepartment.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingDepartment(null),
            onError: () => setDeletingDepartment(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Department Management
                    </h2>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Department</DialogTitle>
                            </DialogHeader>
                            <DepartmentForm
                                auth={auth}
                                commonData={commonData}
                                onClose={() => setShowCreateDialog(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Departments" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department Name</TableHead>
                                        <TableHead>Parent Department</TableHead>
                                        {isSuperAdmin && (
                                            <TableHead>Company</TableHead>
                                        )}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.data.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>{dept.name}</TableCell>
                                            <TableCell>{dept.parent?.name ?? 'N/A'}</TableCell>
                                            {isSuperAdmin && (
                                                <TableCell>{dept.company?.name ?? 'N/A'}</TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingDepartment(dept)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeletingDepartment(dept)} className="text-red-600">
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
                            <Pagination links={departments.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (Modal: Edit) */}
            <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department: {editingDepartment?.name}</DialogTitle>
                    </DialogHeader>
                    <DepartmentForm
                        department={editingDepartment}
                        auth={auth}
                        commonData={commonData}
                        onClose={() => setEditingDepartment(undefined)}
                    />
                </DialogContent>
            </Dialog>

            {/* (Modal: Delete) */}
            <AlertDialog open={!!deletingDepartment} onOpenChange={(open) => !open && setDeletingDepartment(null)}>
                <AlertDialogContent>
                    {deletingDepartment ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingDepartment?.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingDepartment(null)}>Cancel</Button>
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
