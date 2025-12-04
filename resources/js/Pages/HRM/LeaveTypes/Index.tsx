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
    AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge'; // (Import Badge)
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- (Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface LeaveType {
    id: number;
    name: string;
    code: string | null;
    is_paid: boolean;
    max_days_per_year: number | null;
    company?: Company | null;
    company_id: number;
}
interface AuthUser extends User {
    company: Company | null;
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    leaveTypes: {
        data: LeaveType[];
        links: any[];
    };
    commonData: {
        companies: Company[];
    };
}

// --- (Component ย่อย: LeaveTypeForm) ---
function LeaveTypeForm({ leaveType, commonData, auth, onClose }: {
    leaveType?: LeaveType,
    commonData: IndexPageProps['commonData'],
    auth: IndexPageProps['auth'],
    onClose: () => void
}) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: leaveType?.name || '',
        code: leaveType?.code || '',
        is_paid: leaveType?.is_paid || true,
        max_days_per_year: leaveType?.max_days_per_year || '', // (ใช้ '' (string) สำหรับ input number)
        company_id: String(leaveType?.company_id || (isSuperAdmin ? '' : (auth.user.company_id || ''))),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // (แปลงค่าว่างเป็น null)
        const formData = {
            ...data,
            max_days_per_year: data.max_days_per_year === '' ? null : data.max_days_per_year,
        };

        if (leaveType) {
            patch(route('hrm.leave-types.update', leaveType.id), {
                data: formData,
                onSuccess: () => { reset(); onClose(); },
                preserveScroll: true,
            });
        } else {
            post(route('hrm.leave-types.store'), {
                data: formData,
                onSuccess: () => { reset(); onClose(); },
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (Company Dropdown - สำหรับ Super Admin) */}
            {isSuperAdmin && (
                <div className="space-y-2">
                    <Label htmlFor="company_id">Company</Label>
                    <Select onValueChange={(value) => setData('company_id', value)} value={data.company_id}>
                        <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                        <SelectContent>
                            {commonData.companies.map((company) => (
                                <SelectItem key={company.id} value={String(company.id)}>{company.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.company_id} />
                </div>
            )}

            {/* (Name & Code) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Leave Type Name</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="code">Code (e.g., SK, AL)</Label>
                    <Input id="code" value={data.code || ''} onChange={(e) => setData('code', e.target.value)} />
                    <InputError message={errors.code} />
                </div>
            </div>

            {/* (Max Days / Quota) */}
            <div className="space-y-2">
                <Label htmlFor="max_days_per_year">Annual Quota (Days)</Label>
                <Input
                    id="max_days_per_year"
                    type="number"
                    step="0.5"
                    placeholder="Leave blank for unlimited"
                    value={data.max_days_per_year}
                    onChange={(e) => setData('max_days_per_year', e.target.value)}
                />
                <InputError message={errors.max_days_per_year} />
            </div>

            {/* (Is Paid Checkbox) */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_paid"
                    checked={data.is_paid}
                    onCheckedChange={(checked) => setData('is_paid', !!checked)}
                />
                <Label htmlFor="is_paid">This is a Paid Leave</Label>
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

// --- (Component หลัก: LeaveTypeIndex) ---
export default function LeaveTypeIndex({ auth, leaveTypes, commonData }: IndexPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | undefined>();
    const [deletingLeaveType, setDeletingLeaveType] = useState<LeaveType | null>(null);

    const { delete: inertiaDelete, processing: deleting } = useForm();
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const submitDelete = () => {
        if (!deletingLeaveType) return;
        inertiaDelete(route('hrm.leave-types.destroy', deletingLeaveType.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingLeaveType(null),
            onError: () => setDeletingLeaveType(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Leave Type Management
                    </h2>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Leave Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Leave Type</DialogTitle>
                            </DialogHeader>
                            <DialogDescription></DialogDescription>
                            <LeaveTypeForm
                                auth={auth}
                                commonData={commonData}
                                onClose={() => setShowCreateDialog(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            }
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Leave Types" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Annual Quota (Days)</TableHead>
                                        <TableHead>Paid</TableHead>
                                        {isSuperAdmin && <TableHead>Company</TableHead>}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveTypes.data.map((lt) => (
                                        <TableRow key={lt.id}>
                                            <TableCell>{lt.name}</TableCell>
                                            <TableCell>{lt.code ?? 'N/A'}</TableCell>
                                            <TableCell>
                                                {lt.max_days_per_year ?? <span className="text-muted-foreground">Unlimited</span>}
                                            </TableCell>
                                            <TableCell>
                                                {lt.is_paid ? (
                                                    <Badge variant="default">Paid</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Unpaid</Badge>
                                                )}
                                            </TableCell>
                                            {isSuperAdmin && <TableCell>{lt.company?.name ?? 'N/A'}</TableCell>}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingLeaveType(lt)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeletingLeaveType(lt)} className="text-red-600">
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
                            <Pagination links={leaveTypes.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (Modal: Edit) */}
            <Dialog open={!!editingLeaveType} onOpenChange={(open) => !open && setEditingLeaveType(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Leave Type: {editingLeaveType?.name}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <LeaveTypeForm
                        leaveType={editingLeaveType}
                        auth={auth}
                        commonData={commonData}
                        onClose={() => setEditingLeaveType(undefined)}
                    />
                </DialogContent>
            </Dialog>

            {/* (Modal: Delete) */}
            <AlertDialog open={!!deletingLeaveType} onOpenChange={(open) => !open && setDeletingLeaveType(null)}>
                <AlertDialogContent>
                    {deletingLeaveType ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingLeaveType?.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingLeaveType(null)}>Cancel</Button>
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
