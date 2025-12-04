import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, PlusCircle, Trash2, X } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- (Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Approver { id: number; name: string; }
interface EmployeeStub { id: number; user: { id: number; name: string; } }
interface OvertimeRequest {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    total_hours: number;
    ot_type: 'normal' | 'weekend' | 'holiday';
    status: 'pending' | 'approved' | 'rejected';
    reason: string | null;
    approver: Approver | null;
    employee_profile?: EmployeeStub;
    created_at: string;
}
interface AuthUser extends User {
    company: Company | null;
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    myOvertimeRequests: OvertimeRequest[];
    teamOvertimeRequests: OvertimeRequest[];
}

// --- (Component ย่อย: OvertimeRequestForm) ---
function OvertimeRequestForm({ onClose }: {
    onClose: () => void
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        start_time: '',
        end_time: '',
        ot_type: 'normal' as OvertimeRequest['ot_type'],
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.overtime-requests.store'), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (Date) */}
            <div className="space-y-2">
                <Label htmlFor="date">Date of Overtime</Label>
                <Input id="date" type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                <InputError message={errors.date} />
            </div>

            {/* (Start/End Time) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time (HH:mm)</Label>
                    <Input id="start_time" type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} />
                    <InputError message={errors.start_time} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_time">End Time (HH:mm)</Label>
                    <Input id="end_time" type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} />
                    <InputError message={errors.end_time} />
                </div>
            </div>

            {/* (OT Type) */}
            <div className="space-y-2">
                <Label htmlFor="ot_type">Overtime Type</Label>
                <Select onValueChange={(value: OvertimeRequest['ot_type']) => setData('ot_type', value)} value={data.ot_type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">Normal Day</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                        <SelectItem value="holiday">Public Holiday</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.ot_type} />
            </div>

            {/* (Reason) */}
            <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea id="reason" value={data.reason} onChange={(e) => setData('reason', e.target.value)} />
                <InputError message={errors.reason} />
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Submitting...' : 'Submit Request'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// --- (Component ย่อย: Status Badge) ---
const StatusBadge = ({ status }: { status: OvertimeRequest['status'] }) => {
    switch (status) {
        case 'approved':
            return <Badge variant="default">Approved</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'pending':
        default:
            return <Badge variant="outline">Pending</Badge>;
    }
};

// --- (1. เพิ่ม) Helper Function สำหรับแปลงวันที่ ---
const formatThaiDate = (dateString: string): string => {
    const date = new Date(dateString); // (Laravel ส่ง ISO String มา)

    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        weekday: 'short', // (ศ.)
        day: 'numeric',   // (7)
        month: 'short',   // (พ.ย.)
        year: '2-digit',  // (68)
    }).format(date);
};

// --- (Component หลัก: OvertimeRequestIndex) ---
export default function OvertimeRequestIndex({ auth, myOvertimeRequests, teamOvertimeRequests }: IndexPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deletingRequest, setDeletingRequest] = useState<OvertimeRequest | null>(null);
    const { delete: inertiaDelete, processing: deleting } = useForm();

    // (Action Handlers)
    const handleApprove = (id: number) => {
        router.patch(route('hrm.overtime-requests.approve', id), {}, { preserveScroll: true });
    };
    const handleReject = (id: number) => {
        router.patch(route('hrm.overtime-requests.reject', id), {}, { preserveScroll: true });
    };
    const submitDelete = () => {
        if (!deletingRequest) return;
        inertiaDelete(route('hrm.overtime-requests.destroy', deletingRequest.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingRequest(null),
            onError: () => setDeletingRequest(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Overtime (OT) Request
                    </h2>
                    {/* (ปุ่ม Create) */}
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> New OT Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit New Overtime Request</DialogTitle>
                            </DialogHeader>
                            <OvertimeRequestForm
                                onClose={() => setShowCreateDialog(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            }
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Overtime Requests" />

            {/* (ส่วนของ Manager/HR) */}
            {teamOvertimeRequests.length > 0 && (
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader>
                                <CardTitle>Team OT Requests (Awaiting Approval)</CardTitle>
                                <CardDescription>These are pending OT requests from your subordinates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Hours</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teamOvertimeRequests.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell>{req.employee_profile?.user.name}</TableCell>
                                                <TableCell>{req.date}</TableCell>
                                                <TableCell>{req.start_time} - {req.end_time}</TableCell>
                                                <TableCell>
                                                    {/* (บังคับแปลงเป็น Number ก่อน .toFixed()) */}
                                                    {parseFloat(String(req.total_hours)).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleReject(req.id)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" className="text-green-500" onClick={() => handleApprove(req.id)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* (ส่วนของ "My OT History") */}
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Overtime History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Approver</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myOvertimeRequests.length > 0 ? (
                                        myOvertimeRequests.map((req) => {

                                            // --- (1. แก้ไข) ---
                                            // (แปลงเป็นตัวเลข และเช็ค null)
                                            const totalHours = req.total_hours ? parseFloat(String(req.total_hours)) : null;
                                            // --- (สิ้นสุดการแก้ไข) ---

                                            return (
                                                <TableRow key={req.id}>
                                                    <TableCell>{formatThaiDate(req.date)}</TableCell>
                                                    <TableCell>{req.start_time} - {req.end_time}</TableCell>

                                                    {/* --- (2. แก้ไข) --- */}
                                                    <TableCell>
                                                        {/* (ใช้ totalHours ที่เราแปลงแล้ว) */}
                                                        {totalHours !== null ? totalHours.toFixed(2) : 'N/A'}
                                                    </TableCell>
                                                    {/* --- (สิ้นสุดการแก้ไข) --- */}

                                                    <TableCell>{req.ot_type}</TableCell>
                                                    <TableCell><StatusBadge status={req.status} /></TableCell>
                                                    <TableCell>{req.approver?.name ?? 'N/A'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {req.status === 'pending' && (
                                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDeletingRequest(req)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                You have not submitted any overtime requests.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* (Modal: Delete) */}
            <AlertDialog open={!!deletingRequest} onOpenChange={(open) => !open && setDeletingRequest(null)}>
                <AlertDialogContent>
                    {deletingRequest ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete OT Request?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this pending request for {deletingRequest.date}?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <Button variant="outline" onClick={() => setDeletingRequest(null)}>Cancel</Button>
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
