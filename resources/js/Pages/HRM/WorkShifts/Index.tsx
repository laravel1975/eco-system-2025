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
import { Card, CardContent, CardFooter } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox'; // (1. Import Checkbox)

// --- (Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface WorkShift {
    id: number;
    name: string;
    code: string | null;
    start_time: string | null;
    end_time: string | null;
    work_hours_per_day: number;
    is_flexible: boolean;
    company?: Company | null;
    company_id: number;
}
interface AuthUser extends User {
    company: Company | null;
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    workShifts: {
        data: WorkShift[];
        links: any[];
    };
    commonData: {
        companies: Company[];
    };
}

// --- (Component ย่อย: WorkShiftForm) ---
function WorkShiftForm({ shift, commonData, auth, onClose }: {
    shift?: WorkShift,
    commonData: IndexPageProps['commonData'],
    auth: IndexPageProps['auth'],
    onClose: () => void
}) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: shift?.name || '',
        code: shift?.code || '',
        is_flexible: shift?.is_flexible || false,
        start_time: shift?.start_time || '',
        end_time: shift?.end_time || '',
        work_hours_per_day: shift?.work_hours_per_day || 8.00,
        company_id: String(shift?.company_id || (isSuperAdmin ? '' : (auth.user.company_id || ''))),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // (ถ้าเป็น Flexible, ให้ล้างค่าเวลา)
        const formData = { ...data };
        if (data.is_flexible) {
            formData.start_time = '';
            formData.end_time = '';
        }

        if (shift) {
            patch(route('hrm.work-shifts.update', shift.id), {
                data: formData,
                onSuccess: () => { reset(); onClose(); },
                preserveScroll: true,
            });
        } else {
            post(route('hrm.work-shifts.store'), {
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

            {/* (Shift Name & Code) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Shift Name</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="code">Code (Optional)</Label>
                    <Input id="code" value={data.code || ''} onChange={(e) => setData('code', e.target.value)} />
                    <InputError message={errors.code} />
                </div>
            </div>

            {/* (Work Hours) */}
            <div className="space-y-2">
                <Label htmlFor="work_hours_per_day">Work Hours per Day</Label>
                <Input
                    id="work_hours_per_day"
                    type="number"
                    step="0.1"
                    value={data.work_hours_per_day}
                    onChange={(e) => setData('work_hours_per_day', parseFloat(e.target.value))}
                />
                <InputError message={errors.work_hours_per_day} />
            </div>

            {/* (Is Flexible Checkbox) */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_flexible"
                    checked={data.is_flexible}
                    onCheckedChange={(checked) => setData('is_flexible', !!checked)}
                />
                <Label htmlFor="is_flexible">Flexible Shift</Label>
            </div>

            {/* (Start/End Time - ซ่อนถ้าเป็น Flexible) */}
            {!data.is_flexible && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                            id="start_time"
                            type="time" // (ใช้อินพุตเวลา)
                            value={data.start_time || ''}
                            onChange={(e) => setData('start_time', e.target.value)}
                        />
                        <InputError message={errors.start_time} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                            id="end_time"
                            type="time"
                            value={data.end_time || ''}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                        <InputError message={errors.end_time} />
                    </div>
                </div>
            )}

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

// --- (Component หลัก: WorkShiftIndex) ---
export default function WorkShiftIndex({ auth, workShifts, commonData }: IndexPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingShift, setEditingShift] = useState<WorkShift | undefined>();
    const [deletingShift, setDeletingShift] = useState<WorkShift | null>(null);

    const { delete: inertiaDelete, processing: deleting } = useForm();
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const submitDelete = () => {
        if (!deletingShift) return;
        inertiaDelete(route('hrm.work-shifts.destroy', deletingShift.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingShift(null),
            onError: () => setDeletingShift(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Work Shift Management
                    </h2>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Work Shift
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Work Shift</DialogTitle>
                            </DialogHeader>
                            <WorkShiftForm
                                auth={auth}
                                commonData={commonData}
                                onClose={() => setShowCreateDialog(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <Head title="Work Shifts" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shift Name</TableHead>
                                        <TableHead>Work Hours</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        {isSuperAdmin && <TableHead>Company</TableHead>}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workShifts.data.map((shift) => (
                                        <TableRow key={shift.id}>
                                            <TableCell>{shift.name}</TableCell>
                                            <TableCell>{shift.work_hours_per_day} hrs</TableCell>
                                            <TableCell>
                                                {shift.is_flexible ? (
                                                    <span className="text-muted-foreground">Flexible</span>
                                                ) : (
                                                    <span>{shift.start_time} - {shift.end_time}</span>
                                                )}
                                            </TableCell>
                                            {isSuperAdmin && <TableCell>{shift.company?.name ?? 'N/A'}</TableCell>}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingShift(shift)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeletingShift(shift)} className="text-red-600">
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
                            <Pagination links={workShifts.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (Modal: Edit) */}
            <Dialog open={!!editingShift} onOpenChange={(open) => !open && setEditingShift(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Work Shift: {editingShift?.name}</DialogTitle>
                    </DialogHeader>
                    <WorkShiftForm
                        shift={editingShift}
                        auth={auth}
                        commonData={commonData}
                        onClose={() => setEditingShift(undefined)}
                    />
                </DialogContent>
            </Dialog>

            {/* (Modal: Delete) */}
            <AlertDialog open={!!deletingShift} onOpenChange={(open) => !open && setDeletingShift(null)}>
                <AlertDialogContent>
                    {deletingShift ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingShift?.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingShift(null)}>Cancel</Button>
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
