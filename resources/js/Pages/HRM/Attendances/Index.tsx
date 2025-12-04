import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react'; // (1. Import router)
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Calendar as CalendarIcon, FileUp, MapPin } from 'lucide-react'; // (2. Import ไอคอน)
import Pagination from '@/Components/Pagination';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { ImportModal } from './Partials/ImportModal';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// --- (2. แก้ไข Interfaces) ---
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface WorkShift { id: number; name: string; start_time: string | null; }
interface Attendance {
    id: number;
    clock_in: string | null;
    clock_out: string | null;
    total_work_hours: number | null;
    status: string;
    notes: string | null;
    // (เพิ่ม Fields GPS)
    clock_in_latitude: number | null;
    clock_in_longitude: number | null;
    clock_out_latitude: number | null;
    clock_out_longitude: number | null;
}
interface LeaveRequest { id: number; leave_type: { name: string; }; }
interface EmployeeStub { id: number; first_name: string; last_name: string; }
interface EmployeeWithAttendance {
    id: number;
    first_name: string;
    last_name: string;
    user: { id: number; name: string; } | null;
    workShift: WorkShift | null;
    attendances: Attendance[];
    leaveRequests: LeaveRequest[];
}
interface AuthUser extends User {
    company: Company | null;
}
interface IndexPageProps extends PageProps {
    auth: { user: AuthUser; };
    employeesWithAttendance: {
        data: EmployeeWithAttendance[];
        links: any[];
    };
    filters: {
        date: string;
    };
    commonData: {
        employees: EmployeeStub[];
    };
}
// --- (สิ้นสุด Interface) ---

// --- (Helper: แปลง Timestamp เป็น HH:mm) ---
const formatTime = (datetime: string | null | undefined): string => {
    if (!datetime) return 'N/A';
    // (ตัดเอาแค่ HH:mm)
    return new Date(datetime).toTimeString().slice(0, 5);
};

// --- (Helper: Status Badge) ---
const StatusBadge = ({ attendance, leave }: { attendance: Attendance | null, leave: LeaveRequest | null }) => {
    if (leave) {
        return <Badge variant="outline">On Leave ({leave.leave_type.name})</Badge>;
    }
    if (!attendance) {
        // (ต้องเช็ค Holiday ตรงนี้ ถ้า Controller ส่งมา)
        return <Badge variant="destructive">Absent</Badge>;
    }
    switch (attendance.status) {
        case 'present':
            return <Badge variant="outline">Present</Badge>;
        case 'late':
            return <Badge variant="outline">Late</Badge>;
        case 'wfh':
            return <Badge variant="secondary">Work From Home</Badge>;
        case 'holiday':
            return <Badge variant="outline">Holiday</Badge>;
        case 'absent':
        default:
            return <Badge variant="destructive">Absent</Badge>;
    }
};

// --- (Component ย่อย: AdjustmentForm) ---
function AdjustmentForm({ employee, date, onClose }: {
    employee: EmployeeWithAttendance,
    date: string, // (YYYY-MM-DD)
    onClose: () => void
}) {
    // (ดึงข้อมูล Attendance ปัจจุบัน)
    const currentAttendance = employee.attendances.length > 0 ? employee.attendances[0] : null;

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_profile_id: employee.id,
        date: date,
        status: currentAttendance?.status || 'absent',
        clock_in: formatTime(currentAttendance?.clock_in),
        clock_out: formatTime(currentAttendance?.clock_out),
        notes: currentAttendance?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.attendances.store'), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    const statusOptions = ['present', 'late', 'absent', 'on_leave', 'holiday', 'wfh'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (Employee Name - แสดงผลอย่างเดียว) */}
            <div className="space-y-2">
                <Label>Employee</Label>
                <Input value={`${employee.first_name} ${employee.last_name}`} disabled />
            </div>

            {/* (Status) */}
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setData('status', value)} value={data.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.status} />
            </div>

            {/* (Clock In / Clock Out) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="clock_in">Clock In (HH:mm)</Label>
                    <Input id="clock_in" type="time" value={data.clock_in} onChange={(e) => setData('clock_in', e.target.value)} />
                    <InputError message={errors.clock_in} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clock_out">Clock Out (HH:mm)</Label>
                    <Input id="clock_out" type="time" value={data.clock_out} onChange={(e) => setData('clock_out', e.target.value)} />
                    <InputError message={errors.clock_out} />
                </div>
            </div>

            {/* (Notes/Reason) */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes / Adjustment Reason</Label>
                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                <InputError message={errors.notes} />
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Adjustment'}
                </Button>
            </DialogFooter>
        </form>
    );
}

// --- (Component หลัก: AttendanceIndex) ---
export default function AttendanceIndex({ auth, employeesWithAttendance, filters, commonData }: IndexPageProps) {

    // (State สำหรับ Date Filter)
    const [selectedDate, setSelectedDate] = useState(filters.date);

    // (State สำหรับ Modal)
    const [adjustingEmployee, setAdjustingEmployee] = useState<EmployeeWithAttendance | null>(null);

    const [showImportModal, setShowImportModal] = useState(false);

    // (อัปเดต State เมื่อ Filter เปลี่ยน)
    useEffect(() => {
        setSelectedDate(filters.date);
    }, [filters.date]);

    // (ฟังก์ชันเมื่อเปลี่ยนวันที่)
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);

        // (ยิง Inertia.get() เพื่อโหลดข้อมูลใหม่)
        router.get(route('hrm.attendances.index'), {
            date: newDate, // (Query parameter)
        }, {
            preserveState: true,
            replace: true, // (ไม่เพิ่มใน History)
        });
    };

    // --- (3. เพิ่ม) Helper Function สำหรับสร้าง URL แผนที่ ---
    const createGoogleMapsUrl = (lat: number, lng: number) => {
        return `https://maps.google.com/?q=${lat},${lng}`;
    };

    // --- (1. เพิ่ม) Helper Function สำหรับแปลงวันที่ ---
    const formatThaiDate = (dateString: string): string => {
        const date = new Date(`${dateString}T00:00:00`); // (บังคับ Timezone ท้องถิ่น)

        // (ใช้ "th-TH-u-ca-buddhist" เพื่อให้เป็นปี พ.ศ.)
        return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
            weekday: 'short', // (ศ.)
            day: 'numeric',   // (10)
            month: 'short',   // (พ.ย.)
            year: '2-digit',  // (68)
        }).format(date);
    };

    // --- (2. เพิ่ม) คำนวณวันที่ (ทำครั้งเดียว) ---
    const formattedThaiDate = formatThaiDate(filters.date);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Attendance Management
                    </h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="default" size={'icon'} onClick={() => setShowImportModal(true)}>
                            <FileUp className="h-2 w-2" />
                        </Button>

                        {/* (Date Filter) */}
                        <div className="relative w-[220px]">
                            <Label
                                htmlFor="date-filter"
                                className="absolute -top-2 left-3 bg-white dark:bg-gray-900 text-xs text-gray-500 px-1 z-10"
                            >
                                Showing data for
                            </Label>

                            <div className="relative mt-2">
                                <CalendarIcon className="absolute ml-2 left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <Input
                                    id="date-filter"
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="pl-9 pr-3 py-2 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Attendance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employeesWithAttendance.data.map((employee) => {
                                        // (ดึงข้อมูล Attendace/Leave ของพนักงานคนนี้)
                                        const attendance = (employee.attendances?.length || 0) > 0 ? employee.attendances[0] : null;
                                        const leave = (employee.leaveRequests?.length || 0) > 0 ? employee.leaveRequests[0] : null;

                                        // (แปลง total_work_hours เป็นตัวเลขก่อน)
                                        const totalHours = attendance?.total_work_hours ? parseFloat(String(attendance.total_work_hours)) : null;

                                        return (
                                            <TableRow key={employee.id}>
                                                <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                                                <TableCell>{employee.workShift?.name ?? 'N/A'}</TableCell>
                                                <TableCell>{formattedThaiDate}</TableCell>

                                                {/* --- (4. แก้ไข "Clock In" Cell) --- */}
                                                <TableCell>
                                                    {attendance?.clock_in && attendance.clock_in_latitude && attendance.clock_in_longitude ? (
                                                        <a
                                                            href={createGoogleMapsUrl(attendance.clock_in_latitude, attendance.clock_in_longitude)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                            <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                                                            {formatTime(attendance.clock_in)}
                                                        </a>
                                                    ) : (
                                                        formatTime(attendance?.clock_in)
                                                    )}
                                                </TableCell>

                                                {/* --- (5. แก้ไข "Clock Out" Cell) --- */}
                                                <TableCell>
                                                    {attendance?.clock_out && attendance.clock_out_latitude && attendance.clock_out_longitude ? (
                                                        <a
                                                            href={createGoogleMapsUrl(attendance.clock_out_latitude, attendance.clock_out_longitude)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                            <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                                                            {formatTime(attendance.clock_out)}
                                                        </a>
                                                    ) : (
                                                        formatTime(attendance?.clock_out)
                                                    )}
                                                </TableCell>
                                                {/* --- (สิ้นสุดการแก้ไข) --- */}

                                                <TableCell>
                                                    {/* (ใช้ totalHours ที่เราแปลงแล้ว) */}
                                                    {totalHours ? totalHours.toFixed(2) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge attendance={attendance} leave={leave} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {/* (ปุ่ม Adjust) */}
                                                    <Button variant="ghost" size="icon" onClick={() => setAdjustingEmployee(employee)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Pagination links={employeesWithAttendance.links} />
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* (Modal: Adjustment) */}
            <Dialog open={!!adjustingEmployee} onOpenChange={(open) => !open && setAdjustingEmployee(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Attendance Adjustment</DialogTitle>
                        <DialogDescription>
                            Manually adjust attendance record for {adjustingEmployee?.first_name} on {filters.date}.
                        </DialogDescription>
                    </DialogHeader>
                    {/* (ตรวจสอบว่ามี adjustingEmployee ก่อน Render) */}
                    {adjustingEmployee && (
                        <AdjustmentForm
                            employee={adjustingEmployee}
                            date={filters.date}
                            onClose={() => setAdjustingEmployee(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ImportModal
                open={showImportModal}
                onOpenChange={setShowImportModal}
            />

        </AuthenticatedLayout>
    );
}
