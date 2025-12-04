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
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- (Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Holiday {
    id: number;
    name: string;
    date: string; // (YYYY-MM-DD)
    is_recurring: boolean;
    company?: Company | null;
    company_id: number;
}
interface AuthUser extends User {
    company: Company | null;
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    holidays: {
        data: Holiday[];
        links: any[];
    };
    commonData: {
        companies: Company[];
    };
}

// --- (Component ย่อย: HolidayForm) ---
function HolidayForm({ holiday, commonData, auth, onClose }: {
    holiday?: Holiday,
    commonData: IndexPageProps['commonData'],
    auth: IndexPageProps['auth'],
    onClose: () => void
}) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: holiday?.name || '',
        date: holiday?.date || '', // (ค่าเริ่มต้นเป็น YYYY-MM-DD)
        is_recurring: holiday?.is_recurring || true,
        company_id: String(holiday?.company_id || (isSuperAdmin ? '' : (auth.user.company_id || ''))),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (holiday) {
            patch(route('hrm.holidays.update', holiday.id), {
                onSuccess: () => { reset(); onClose(); },
                preserveScroll: true,
            });
        } else {
            post(route('hrm.holidays.store'), {
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

            {/* (Holiday Name) */}
            <div className="space-y-2">
                <Label htmlFor="name">Holiday Name</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                <InputError message={errors.name} />
            </div>

            {/* (Date) */}
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    type="date" // (ใช้อินพุตวันที่)
                    value={data.date}
                    onChange={(e) => setData('date', e.target.value)}
                />
                <InputError message={errors.date} />
            </div>

            {/* (Is Recurring Checkbox) */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_recurring"
                    checked={data.is_recurring}
                    onCheckedChange={(checked) => setData('is_recurring', !!checked)}
                />
                <Label htmlFor="is_recurring">Recurring (Repeats every year)</Label>
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

// --- (Component หลัก: HolidayIndex) ---
export default function HolidayIndex({ auth, holidays, commonData }: IndexPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | undefined>();
    const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);

    const { delete: inertiaDelete, processing: deleting } = useForm();
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const submitDelete = () => {
        if (!deletingHoliday) return;
        inertiaDelete(route('hrm.holidays.destroy', deletingHoliday.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingHoliday(null),
            onError: () => setDeletingHoliday(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Holiday Calendar Management
                    </h2>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Holiday
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Holiday</DialogTitle>
                                <DialogDescription></DialogDescription>
                            </DialogHeader>
                            <HolidayForm
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
            <Head title="Holidays" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Holiday Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Recurring</TableHead>
                                        {isSuperAdmin && <TableHead>Company</TableHead>}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {holidays.data.map((holiday) => (
                                        <TableRow key={holiday.id}>
                                            <TableCell>{holiday.name}</TableCell>
                                            <TableCell>{holiday.date}</TableCell>
                                            <TableCell>
                                                {holiday.is_recurring ? 'Yes' : 'No'}
                                            </TableCell>
                                            {isSuperAdmin && <TableCell>{holiday.company?.name ?? 'N/A'}</TableCell>}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingHoliday(holiday)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeletingHoliday(holiday)} className="text-red-600">
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
                            <Pagination links={holidays.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (Modal: Edit) */}
            <Dialog open={!!editingHoliday} onOpenChange={(open) => !open && setEditingHoliday(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Holiday: {editingHoliday?.name}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <HolidayForm
                        holiday={editingHoliday}
                        auth={auth}
                        commonData={commonData}
                        onClose={() => setEditingHoliday(undefined)}
                    />
                </DialogContent>
            </Dialog>

            {/* (Modal: Delete) */}
            <AlertDialog open={!!deletingHoliday} onOpenChange={(open) => !open && setDeletingHoliday(null)}>
                <AlertDialogContent>
                    {deletingHoliday ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {deletingHoliday?.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingHoliday(null)}>Cancel</Button>
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
