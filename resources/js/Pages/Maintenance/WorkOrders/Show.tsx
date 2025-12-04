import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react'; // (1. เพิ่ม router)
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';

// (2. [แก้ไข] Import Shadcn & Icons ให้ถูกต้อง)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Separator } from "@/Components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/Components/ui/command";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Check, ChevronsUpDown, User, Wrench, Paperclip, ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, XCircle } from 'lucide-react';
import { Badge } from "@/Components/ui/badge"; // (Import Badge จาก UI)
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/Components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';
import Checkbox from '@/Components/Checkbox';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions (แก้ไข)
|--------------------------------------------------------------------------
*/
interface MaintenanceTask {
    task_name: string;
    description: string | null;
    is_checked: boolean;
}

// Types ย่อย
interface Technician { id: number; first_name: string; last_name: string; }
interface SparePart { id: number; name: string; part_number: string; stock_quantity: number; }
interface Contractor { id: number; name: string; }

// (3. [แก้ไข] Type Assignment)
interface Assignment {
    id: number;
    assignable: (Technician | Contractor) | null; // (สามารถเป็น null ได้ ถ้าข้อมูลถูกลบ)
    actual_labor_hours: number | null; // (ย้ายมาไว้ที่นี่)
}
interface PartUsage { id: number; quantity_used: number; spare_part: SparePart; }
interface Attachment { id: number; file_name: string; file_path: string; }
interface Asset { id: number; name: string; asset_code: string; }
interface MaintenanceType { id: number; name: string; }

interface FailureCode { id: number; name: string; code: string; parent_id: number | null; }
interface ActivityType { id: number; name: string; code: string; }

// Type หลัก (WorkOrder)
interface WorkOrder {
    id: number;
    work_order_code: string;
    status: string;
    priority: string; // (P1, P2, P3, P4)
    work_nature: string; // (Internal, External, Mixed)
    description: string;
    asset: Asset;
    maintenance_type: MaintenanceType;
    assignments: Assignment[]; // (ใช้ Type Assignment ที่แก้ไขแล้ว)
    spare_parts_used: PartUsage[];
    attachments: Attachment[];
    failure_code_id: number | null;
    activity_type_id: number | null;
    downtime_hours: number | null;
    tasks: MaintenanceTask[];
}
// Type ของ Pager
interface PaginationInfo {
    current_index: number;
    total: number;
    next_wo_id: number | null;
    prev_wo_id: number | null;
}
// Type ของ Props
interface Props {
    workOrder: WorkOrder;
    paginationInfo: PaginationInfo;
    availableTechnicians: Technician[];
    availableContractors: Contractor[];
    availableSpareParts: SparePart[];
    failureCodes: FailureCode[];
    activityTypes: ActivityType[];
}

/*
|--------------------------------------------------------------------------
| 2. Helper Components (สำหรับ UI)
|--------------------------------------------------------------------------
*/
// (Helper แสดงสถานะ)
const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
        open: 'bg-blue-100 text-blue-800',
        assigned: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-indigo-100 text-indigo-800',
        completed: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };
    return (
        <Badge variant="outline" className={cn("text-sm", colors[status] || colors.closed)}>
            {status}
        </Badge>
    );
};

// (5. [แก้ไข] Helper แสดง Priority ให้ใช้ P1-P4)
const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: any = {
        'P4': 'bg-gray-100 text-gray-800', // Low
        'P3': 'bg-blue-100 text-blue-800', // Normal
        'P2': 'bg-yellow-100 text-yellow-800', // Urgent
        'P1': 'bg-red-100 text-red-800', // Emergency
    };
    return (
        <Badge variant="outline" className={cn("text-xs", colors[priority] || colors['P4'])}>
            {priority}
        </Badge>
    );
};
// (Helper แสดงรายละเอียด)
const DetailItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{children || '-'}</dd>
    </div>
);
// (Helper: Pager Icons)
const PagerLink = ({ href, disabled, children }: { href: string, disabled: boolean, children: React.ReactNode }) => (
    <Button asChild variant="outline" size="icon" disabled={disabled}>
        <Link href={href} preserveScroll>{children}</Link>
    </Button>
);


/*
|--------------------------------------------------------------------------
| 3. React Component (หน้า Show หลัก)
|--------------------------------------------------------------------------
*/
export default function ShowWorkOrder({ auth, workOrder, paginationInfo, availableTechnicians, availableContractors, availableSpareParts, failureCodes, activityTypes }: PageProps & Props) {

    // (State Modals)
    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignContractorModalOpen, setAssignContractorModalOpen] = useState(false); // ( [ใหม่] State)
    const [partModalOpen, setPartModalOpen] = useState(false);
    const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
    const [confirmDeleteAssignment, setConfirmDeleteAssignment] = useState<Assignment | null>(null); // ( [ใหม่] State)

    // --- (ฟอร์ม 1.1: มอบหมายช่าง) ---
    const assignForm = useForm({ employee_id: '' });
    const onAssignSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        assignForm.post(route('maintenance.work-orders.assignments.store-technician', workOrder.id), {
            onSuccess: () => { setAssignModalOpen(false); assignForm.reset(); },
            preserveScroll: true,
        });
    };

    // --- (ฟอร์ม 1.2: มอบหมายผู้รับเหมา) ---
    const assignContractorForm = useForm({ contractor_id: '' });
    const onAssignContractorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        assignContractorForm.post(route('maintenance.work-orders.assignments.store-contractor', workOrder.id), {
            onSuccess: () => { setAssignContractorModalOpen(false); assignContractorForm.reset(); },
            preserveScroll: true,
        });
    };

    // --- (ฟอร์ม 1.3: ลบ Assignment) ---
    const deleteAssignment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!confirmDeleteAssignment) return;
        router.delete(route('maintenance.work-orders.assignments.destroy', [workOrder.id, confirmDeleteAssignment.id]), {
            onSuccess: () => setConfirmDeleteAssignment(null),
            preserveScroll: true,
        });
    };

    // --- (ฟอร์ม 2 & 3: อะไหล่ & ไฟล์แนบ - เหมือนเดิม) ---
    const partForm = useForm({ spare_part_id: '', quantity_used: 1, });
    const onPartSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        partForm.post(route('maintenance.work-orders.spare-parts.store', workOrder.id), {
            onSuccess: () => { setPartModalOpen(false); partForm.reset(); },
            preserveScroll: true,
        });
    };
    const selectedPartStock = availableSpareParts.find(p => String(p.id) === partForm.data.spare_part_id)?.stock_quantity || 0;
    const attachmentForm = useForm<{ file: File | null, description: string }>({ file: null, description: '', });
    const onAttachmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        attachmentForm.post(route('maintenance.work-orders.attachments.store', workOrder.id), {
            onSuccess: () => { setAttachmentModalOpen(false); attachmentForm.reset(); },
            preserveScroll: true,
        });
    };

    // --- (ฟอร์ม 4: ปิดงาน - [อัปเกรด]) ---
    const getInitialAssignmentHours = () => {
        return workOrder.assignments.map(a => ({
            id: a.id,
            hours: a.actual_labor_hours || 0,
        }));
    };
    const completionForm = useForm({
        failure_code_id: String(workOrder.failure_code_id || ''),
        activity_type_id: String(workOrder.activity_type_id || ''),
        downtime_hours: workOrder.downtime_hours || 0,
        assignments: getInitialAssignmentHours(),
    });
    // (Helper: อัปเดตชั่วโมง)
    const setAssignmentHours = (assignmentId: number, hours: number) => {
        completionForm.setData('assignments',
            completionForm.data.assignments.map(a =>
                a.id === assignmentId ? { ...a, hours: Math.max(0, hours) } : a
            )
        );
    };
    const onCompleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        completionForm.post(route('maintenance.work-orders.workflow.complete', workOrder.id), {
            onSuccess: () => { setCompletionModalOpen(false); },
            preserveScroll: true,
        });
    };

    // (6. [แก้ไข] Helper: หาชื่อ Assignee (เพิ่ม Null Check))
    const getAssignableName = (assignable: Assignment['assignable']) => {
        if (!assignable) return <span className="text-red-500">Error: Assignee deleted</span>;
        if ('first_name' in assignable) {
            return `${assignable.first_name} ${assignable.last_name}`;
        }
        return assignable.name;
    };

    // (Helper: จัดกลุ่ม RCA - เหมือนเดิม)
    const failureCodeGroups = React.useMemo(() => {
        const parents = failureCodes.filter(c => c.parent_id === null);
        return parents.map(parent => ({
            ...parent,
            children: failureCodes.filter(c => c.parent_id === parent.id),
        }));
    }, [failureCodes]);

    // 1. คำนวณผลรวมชั่วโมงแรงงานทั้งหมด
    const totalLaborHours = workOrder.assignments.reduce((sum, ass) => sum + (Number(ass.actual_labor_hours) || 0), 0);

    // 2. เช็คสถานะว่างานจบหรือยัง
    const isJobDone = ['completed', 'closed'].includes(workOrder.status);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">ใบสั่งซ่อม #{workOrder.work_order_code}</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title={workOrder.work_order_code} />

            {/* (Header: Breadcrumbs + Pager) */}
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-4">
                    <Breadcrumbs
                        links={[{ label: "ใบสั่งซ่อม", href: route('maintenance.work-orders.index') }]}
                        activeLabel={workOrder.work_order_code}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            {paginationInfo.current_index} / {paginationInfo.total}
                        </span>
                        <PagerLink href={paginationInfo.prev_wo_id ? route('maintenance.work-orders.show', paginationInfo.prev_wo_id) : '#'} disabled={!paginationInfo.prev_wo_id}>
                            <ChevronLeft className="w-4 h-4" />
                        </PagerLink>
                        <PagerLink href={paginationInfo.next_wo_id ? route('maintenance.work-orders.show', paginationInfo.next_wo_id) : '#'} disabled={!paginationInfo.next_wo_id}>
                            <ChevronRight className="w-4 h-4" />
                        </PagerLink>
                    </div>
                </div>
            </div>

            {/* (Grid 2 คอลัมน์) */}
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* (คอลัมน์ซ้าย: รายละเอียด) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* (Card: รายละเอียดหลัก) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{workOrder.description}</CardTitle>
                                <PriorityBadge priority={workOrder.priority} />
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem label="ทรัพย์สิน (Asset)">
                                        <Link href={route('maintenance.assets.show', workOrder.asset.id)} className="text-indigo-600 hover:underline">
                                            {workOrder.asset.asset_code} - {workOrder.asset.name}
                                        </Link>
                                    </DetailItem>
                                    <DetailItem label="ประเภทงาน">
                                        {workOrder.maintenance_type.name}
                                    </DetailItem>
                                    {/* {workOrder.maintenance_request && ( ... )} */}
                                </dl>
                            </CardContent>
                        </Card>

                        {/* (Card: รายการตรวจเช็ค / Checklist) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Check className="w-5 h-5" /> รายการตรวจเช็ค (Checklist)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workOrder.tasks.length === 0 ? (
                                    <p className="text-sm text-gray-500">ไม่มีรายการตรวจเช็ค</p>
                                ) : (
                                    <div className="space-y-4">
                                        {workOrder.tasks.map((task) => (
                                            <div key={task.id} className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0">

                                                {/* (แก้ไข Checkbox ตรงนี้) */}
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        id={`task-${task.id}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                        checked={!!task.is_checked} // (แปลง 1/0 เป็น boolean)
                                                        onChange={() => {
                                                            // ใช้ router.post แบบ preserveScroll
                                                            router.post(route('maintenance.tasks.toggle', task.id), {}, {
                                                                preserveScroll: true,
                                                            });
                                                        }}
                                                        disabled={workOrder.status === 'completed' || workOrder.status === 'closed'}
                                                    />
                                                </div>
                                                {/* (สิ้นสุดการแก้ไข) */}

                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor={`task-${task.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pt-1"
                                                    >
                                                        {task.task_name}
                                                    </label>
                                                    {task.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* (Card: ใช้อะไหล่) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5" /> อะไหล่ที่ใช้</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => setPartModalOpen(true)}>+ บันทึกการใช้</Button>
                            </CardHeader>
                            <CardContent>
                                {workOrder.spare_parts_used.length === 0 ? (
                                    <p className="text-sm text-gray-500">ยังไม่มีการใช้อะไหล่</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>อะไหล่</TableHead>
                                                <TableHead>จำนวน</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workOrder.spare_parts_used.map(use => (
                                                <TableRow key={use.id}>
                                                    <TableCell>{use.spare_part.name}</TableCell>
                                                    <TableCell>{use.quantity_used}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="destructive" size="sm">ลบ</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* (Card: ไฟล์แนบ) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><Paperclip className="w-5 h-5" /> ไฟล์แนบ</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => setAttachmentModalOpen(true)}>+ อัปโหลด</Button>
                            </CardHeader>
                            <CardContent>
                                {workOrder.attachments.length === 0 ? (
                                    <p className="text-sm text-gray-500">ไม่มีไฟล์แนบ</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {workOrder.attachments.map(att => (
                                            <li key={att.id} className="text-sm text-indigo-600 hover:underline">
                                                <a href={att.file_path} target="_blank">{att.file_name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* (คอลัมน์ขวา: สถานะ & ช่าง) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* (Card: สถานะ & Workflow) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>สถานะ</CardTitle>
                                <div className="mt-2">
                                    <StatusBadge status={workOrder.status} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full justify-start gap-2" variant="secondary"
                                    disabled={workOrder.status !== 'assigned'}
                                    asChild>
                                    <Link method="post" href={route('maintenance.work-orders.workflow.start', workOrder.id)} preserveScroll>
                                        <PlayCircle className="w-4 h-4" /> เริ่มงาน
                                    </Link>
                                </Button>

                                <Button className="w-full justify-start gap-2" variant="secondary"
                                    disabled={workOrder.status !== 'in_progress'}
                                    onClick={() => setCompletionModalOpen(true)}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> งานเสร็จสิ้น
                                </Button>

                                <Button className="w-full justify-start gap-2" variant="secondary"
                                    disabled={workOrder.status !== 'completed'}
                                    asChild>
                                    <Link method="post" href={route('maintenance.work-orders.workflow.close', workOrder.id)} preserveScroll>
                                        <XCircle className="w-4 h-4" /> ปิดงาน
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* (Card: ผู้รับผิดชอบ & สรุปประสิทธิภาพ) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" /> ผู้รับผิดชอบ
                                </CardTitle>

                                {/* (ปุ่มเพิ่มคน - ซ่อนถ้างานจบแล้ว) */}
                                {!isJobDone && (
                                    <div className="flex gap-1">
                                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAssignModalOpen(true)}>+ ภายใน</Button>
                                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAssignContractorModalOpen(true)}>+ ภายนอก</Button>
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent>
                                {/* --------------------------------------------------------- */}
                                {/* [ใหม่] ส่วนแสดงสรุป Downtime & Labor Hours (หลังปิดงาน) */}
                                {/* --------------------------------------------------------- */}
                                {isJobDone && (
                                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Downtime</div>
                                            <div className="text-xl font-bold text-red-600 leading-none">
                                                {workOrder.downtime_hours || 0} <span className="text-xs font-normal text-gray-400">ชม.</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Labor Hours</div>
                                            <div className="text-xl font-bold text-indigo-600 leading-none">
                                                {totalLaborHours} <span className="text-xs font-normal text-gray-400">ชม.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* --------------------------------------------------------- */}

                                {workOrder.assignments.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-2">ยังไม่มอบหมายงาน</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {workOrder.assignments.map(ass => (
                                            <li key={ass.id} className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{getAssignableName(ass.assignable)}</span>

                                                    {/* (แสดงชั่วโมงรายคนด้วย ถ้ามี) */}
                                                    {isJobDone && ass.actual_labor_hours && (
                                                        <span className="text-xs text-gray-500">
                                                            ({ass.actual_labor_hours} ชม.)
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {'first_name' in (ass.assignable || {}) ?
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">Internal</Badge> :
                                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">External</Badge>
                                                    }

                                                    {!isJobDone && (
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => setConfirmDeleteAssignment(ass)}>
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>

            {/*
            |--------------------------------------------------------------------------
            | 4. Modals (Dialogs)
            |--------------------------------------------------------------------------
            */}

            {/* (Modal: มอบหมายช่าง) */}
            <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>มอบหมายช่าง (ภายใน)</DialogTitle></DialogHeader>
                    <form onSubmit={onAssignSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>เลือกช่าง</Label>
                            <Select onValueChange={(value) => assignForm.setData('employee_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- ค้นหาชื่อช่าง --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-48">
                                        {availableTechnicians.map(tech => (
                                            <SelectItem key={tech.id} value={String(tech.id)}>
                                                {tech.first_name} {tech.last_name}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            <InputError message={assignForm.errors.employee_id} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={assignForm.processing}>ยืนยัน</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* (Modal: มอบหมายผู้รับเหมา) */}
            <Dialog open={assignContractorModalOpen} onOpenChange={setAssignContractorModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>มอบหมายผู้รับเหมา (ภายนอก)</DialogTitle></DialogHeader>
                    <form onSubmit={onAssignContractorSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>เลือกผู้รับเหมา</Label>
                            <Select onValueChange={(value) => assignContractorForm.setData('contractor_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- ค้นหาชื่อผู้รับเหมา --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-48">
                                        {availableContractors.map(con => (
                                            <SelectItem key={con.id} value={String(con.id)}>
                                                {con.name}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            <InputError message={assignContractorForm.errors.contractor_id} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAssignContractorModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={assignContractorForm.processing}>ยืนยัน</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* (Modal: ยืนยันลบ Assignment) */}
            <AlertDialog open={confirmDeleteAssignment !== null} onOpenChange={(open) => !open && setConfirmDeleteAssignment(null)}>
                <AlertDialogContent>
                    <form onSubmit={deleteAssignment}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                            <AlertDialogDescription>
                                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการมอบหมายงานนี้?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" onClick={() => setConfirmDeleteAssignment(null)}>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700" disabled={assignForm.processing}>
                                ยืนยันการลบ
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            {/* (Modal: ใช้อะไหล่) */}
            <Dialog open={partModalOpen} onOpenChange={setPartModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>บันทึกการใช้อะไหล่</DialogTitle></DialogHeader>
                    <form onSubmit={onPartSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>เลือกอะไหล่</Label>
                            <Select onValueChange={(value) => partForm.setData('spare_part_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- ค้นหาอะไหล่ --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-48">
                                        {availableSpareParts.map(part => (
                                            <SelectItem key={part.id} value={String(part.id)}>
                                                ({part.stock_quantity}) {part.part_number} - {part.name}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            <InputError message={partForm.errors.spare_part_id} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity_used">จำนวนที่ใช้</Label>
                            <Input
                                id="quantity_used"
                                type="number"
                                min="1"
                                max={selectedPartStock}
                                value={partForm.data.quantity_used}
                                onChange={e => partForm.setData('quantity_used', e.target.valueAsNumber)}
                            />
                            {selectedPartStock > 0 && <p className="text-xs text-gray-500">สต็อกคงเหลือ: {selectedPartStock}</p>}
                            <InputError message={partForm.errors.quantity_used} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPartModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={partForm.processing}>ยืนยัน</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* (Modal: แนบไฟล์) */}
            <Dialog open={attachmentModalOpen} onOpenChange={setAttachmentModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>อัปโหลดไฟล์แนบ</DialogTitle></DialogHeader>
                    <form onSubmit={onAttachmentSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">เลือกไฟล์ (jpg, png, pdf, xlsx)</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={e => attachmentForm.setData('file', e.target.files ? e.target.files[0] : null)}
                            />
                            <InputError message={attachmentForm.errors.file} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">คำอธิบาย (ถ้ามี)</Label>
                            <Input
                                id="description"
                                type="text"
                                value={attachmentForm.data.description}
                                onChange={e => attachmentForm.setData('description', e.target.value)}
                            />
                            <InputError message={attachmentForm.errors.description} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAttachmentModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={attachmentForm.processing}>อัปโหลด</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* (7. [แก้ไข] Modal ปิดงาน - แก้ไข Bug Nested Dialog และ Logic) */}
            <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>บันทึกการปิดงานซ่อม (Completion Report)</DialogTitle>
                    </DialogHeader>
                    {/* (ลบ Dialog ที่ซ้อนกันออกไป) */}
                    <form onSubmit={onCompleteSubmit}>
                        <ScrollArea className="max-h-[70vh] p-6 space-y-4">

                            {/* (RCA & Activity - เหมือนเดิม) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="failure_code_id">สาเหตุการเสีย (RCA) *</Label>
                                    <Select value={String(completionForm.data.failure_code_id || '')} onValueChange={(v) => completionForm.setData('failure_code_id', v)}>
                                        <SelectTrigger id="failure_code_id"><SelectValue placeholder="-- เลือกสาเหตุ --" /></SelectTrigger>
                                        <SelectContent>
                                            {failureCodeGroups.map(group => (
                                                <SelectGroup key={group.id}>
                                                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-gray-900">
                                                        {group.code} - {group.name}
                                                    </SelectLabel>
                                                    {group.children.map(child => (
                                                        <SelectItem key={child.id} value={String(child.id)}>
                                                            <span className="pl-4">{child.code} - {child.name}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={completionForm.errors.failure_code_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="activity_type_id">กิจกรรมที่ทำ *</Label>
                                    <Select value={String(completionForm.data.activity_type_id || '')} onValueChange={(v) => completionForm.setData('activity_type_id', v)}>
                                        <SelectTrigger id="activity_type_id"><SelectValue placeholder="-- เลือกกิจกรรม --" /></SelectTrigger>
                                        <SelectContent>
                                            {activityTypes.map(type => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.code} - {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={completionForm.errors.activity_type_id} />
                                </div>
                            </div>

                            {/* (Downtime) */}
                            <div className="space-y-2">
                                <Label htmlFor="downtime_hours">เวลาเครื่องจักรหยุด (Downtime) (ชม.) *</Label>
                                <Input
                                    id="downtime_hours"
                                    type="number" min="0" step="0.5"
                                    value={completionForm.data.downtime_hours}
                                    onChange={e => completionForm.setData('downtime_hours', e.target.valueAsNumber)}
                                />
                                <InputError message={completionForm.errors.downtime_hours} />
                            </div>

                            <Separator />

                            {/* (8. [แก้ไข] ใส่ Logic การกรอกชั่วโมงรายคน) */}
                            <div className="space-y-2">
                                <Label>ชั่วโมงทำงานจริง (Labor Hours) *</Label>
                                {completionForm.data.assignments.length === 0 ? (
                                    <p className="text-sm text-red-500">(!) กรุณามอบหมายงานก่อน</p>
                                ) : (
                                    <div className="space-y-3">
                                        {workOrder.assignments.map((ass, index) => {
                                            const formData = completionForm.data.assignments.find(a => a.id === ass.id);
                                            return (
                                                <div key={ass.id} className="grid grid-cols-3 items-center gap-2">
                                                    <Label className="col-span-2 truncate">
                                                        {getAssignableName(ass.assignable)}
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={0.1} // (ควรเป็น 0.1 หรือ 0)
                                                        step="0.1"
                                                        value={formData?.hours || 0}
                                                        onChange={e => setAssignmentHours(ass.id, e.target.valueAsNumber)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <InputError message={completionForm.errors.assignments} />
                            </div>

                        </ScrollArea>
                        <DialogFooter className="mt-4">
                            {/* (ใช้ปุ่ม shadcn/ui) */}
                            <Button type="button" variant="outline" onClick={() => setCompletionModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" disabled={completionForm.processing}>
                                ยืนยันงานเสร็จสิ้น
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
