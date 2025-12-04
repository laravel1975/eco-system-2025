import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react'; // (1. Import router)
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, PlusCircle, Trash2, X } from 'lucide-react'; // (2. Import ไอคอน)
import Pagination from '@/Components/Pagination';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea'; // (3. Import Textarea)
import { Badge } from '@/Components/ui/badge';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- (Interfaces) ---
interface Company { id: number; name: string; }
interface LeaveType { id: number; name: string; max_days_per_year: number | null; }
interface Approver { id: number; name: string; }
interface EmployeeStub { id: number; user: { id: number; name: string; } }
interface LeaveRequest {
    id: number;
    leave_type: LeaveType;
    start_datetime: string;
    end_datetime: string;
    total_days: number;
    status: 'pending' | 'approved' | 'rejected';
    reason: string | null;
    approver: Approver | null;
    employee_profile?: EmployeeStub; // (สำหรับตาราง Manager)
    created_at: string;
}
interface AuthUser extends User {
    company: Company | null;
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    myLeaveRequests: LeaveRequest[];
    subordinateLeaveRequests: LeaveRequest[];
    commonData: {
        leaveTypes: LeaveType[];
    };
}

// --- (Component ย่อย: LeaveRequestForm) ---
function LeaveRequestForm({ commonData, onClose }: {
    commonData: IndexPageProps['commonData'],
    onClose: () => void
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type_id: '',
        start_datetime: '',
        end_datetime: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.leave-requests.store'), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (Leave Type) */}
            <div className="space-y-2">
                <Label htmlFor="leave_type_id">Leave Type</Label>
                <Select onValueChange={(value) => setData('leave_type_id', value)} value={data.leave_type_id}>
                    <SelectTrigger><SelectValue placeholder="Select a leave type" /></SelectTrigger>
                    <SelectContent>
                        {commonData.leaveTypes.map((lt) => (
                            <SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.leave_type_id} />
            </div>

            {/* (Start/End Date) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_datetime">Start Date & Time</Label>
                    <Input id="start_datetime" type="datetime-local" value={data.start_datetime} onChange={(e) => setData('start_datetime', e.target.value)} />
                    <InputError message={errors.start_datetime} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_datetime">End Date & Time</Label>
                    <Input id="end_datetime" type="datetime-local" value={data.end_datetime} onChange={(e) => setData('end_datetime', e.target.value)} />
                    <InputError message={errors.end_datetime} />
                </div>
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
const StatusBadge = ({ status }: { status: LeaveRequest['status'] }) => {
    switch (status) {
        case 'approved':
            return <Badge variant="default">Approved</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'pending':
        default:
            return <Badge variant="secondary">Pending</Badge>;
    }
};

// --- (Component หลัก: LeaveRequestIndex) ---
export default function LeaveRequestIndex({ auth, myLeaveRequests, subordinateLeaveRequests, commonData }: IndexPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // (Action Handlers)
    const handleApprove = (id: number) => {
        router.patch(route('hrm.leave-requests.approve', id), {}, { preserveScroll: true });
    };
    const handleReject = (id: number) => {
        router.patch(route('hrm.leave-requests.reject', id), {}, { preserveScroll: true });
    };
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this pending request?')) {
            router.delete(route('hrm.leave-requests.destroy', id), { preserveScroll: true });
        }
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Leave Request Management
                    </h2>
                    {/* (ปุ่ม Create) */}
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> New Leave Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit New Leave Request</DialogTitle>
                            </DialogHeader>
                            <LeaveRequestForm
                                commonData={commonData}
                                onClose={() => setShowCreateDialog(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            }
            navigationMenu={<HrmNavigationMenu/>}
        >
            <Head title="Leave Requests" />

            {/* (ส่วนของ Manager/HR) */}
            {subordinateLeaveRequests.length > 0 && (
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader>
                                <CardTitle>Team Leave Requests (Awaiting Approval)</CardTitle>
                                <CardDescription>These are pending leave requests from your subordinates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Leave Type</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Days</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subordinateLeaveRequests.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell>{req.employee_profile?.user.name}</TableCell>
                                                <TableCell>{req.leave_type.name}</TableCell>
                                                <TableCell>{new Date(req.start_datetime).toLocaleDateString()} - {new Date(req.end_datetime).toLocaleDateString()}</TableCell>
                                                <TableCell>{req.total_days}</TableCell>
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

            {/* (ส่วนของ "My Leave") */}
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Leave History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Approver</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myLeaveRequests.length > 0 ? (
                                        myLeaveRequests.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell>{req.leave_type.name}</TableCell>
                                                <TableCell>{new Date(req.start_datetime).toLocaleDateString()} - {new Date(req.end_datetime).toLocaleDateString()}</TableCell>
                                                <TableCell>{req.total_days}</TableCell>
                                                <TableCell><StatusBadge status={req.status} /></TableCell>
                                                <TableCell>{req.approver?.name ?? 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    {/* (อนุญาตให้ลบเฉพาะอันที่ยัง Pending) */}
                                                    {req.status === 'pending' && (
                                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(req.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                You have not submitted any leave requests.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
