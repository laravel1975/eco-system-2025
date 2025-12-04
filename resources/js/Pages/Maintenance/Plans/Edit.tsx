import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';

// (Import Shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import InputError from '@/Components/InputError';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PlanTaskForm, { PlanTask } from './Partials/PlanTaskForm';
import { Separator } from '@/Components/ui/separator';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';
import { AssetCombobox } from '@/Components/AssetCombobox';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/
interface Asset { id: number; name: string; asset_code: string; location: string | null; }
interface MaintenanceType { id: number; name: string; }

// (Type ของ Plan ที่รับมา)
interface MaintenancePlan {
    id: number;
    title: string;
    asset_id: number;
    maintenance_type_id: number;
    interval_days: number;
    next_due_date: string; // (เป็น string "YYYY-MM-DD" จาก Laravel)
    status: 'active' | 'inactive';
    tasks: PlanTask[];
}

interface Props {
    plan: MaintenancePlan; // (รับ plan ที่จะแก้ไข)
    assets: Asset[];
    pmTypes: MaintenanceType[];
}

interface PlanFormData {
    title: string;
    asset_id: string;
    maintenance_type_id: string;
    interval_days: number | string;
    next_due_date: Date | undefined;
    status: 'active' | 'inactive';
    tasks: PlanTask[];
}

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function EditMaintenancePlan({ auth, plan, assets, pmTypes }: PageProps & Props) {

    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const { data, setData, patch, delete: destroy, processing, errors, clearErrors } = useForm<PlanFormData>({
        title: plan.title,
        asset_id: String(plan.asset_id),
        maintenance_type_id: String(plan.maintenance_type_id),
        interval_days: plan.interval_days,
        next_due_date: new Date(plan.next_due_date), // (แปลง string เป็น Date)
        status: plan.status,
        tasks: plan.tasks,
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        patch(route('maintenance.plans.update', plan.id));
    }

    function deletePlan(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        destroy(route('maintenance.plans.destroy', plan.id), {
            onSuccess: () => setConfirmingDeletion(false)
        });
    }

    return (
        <AuthenticatedLayout
                    user={auth.user}
                    header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">แก้แผน PM</h2>}
                    // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
                    navigationMenu={<MaintenanceNavigationMenu />}
                >
            <Head title={`แก้ไข: ${plan.title}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">

                    <Breadcrumbs
                        links={[{ label: "แผน PM", href: route('maintenance.plans.index') }]}
                        activeLabel={plan.title}
                    />

                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>แก้ไขแผน PM</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* (Form Fields - เหมือนหน้า Create แต่เพิ่ม Status) */}

                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อแผน *</Label>
                                    <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="asset_id">ทรัพย์สิน (Asset) *</Label>
                                    <AssetCombobox
                                        assets={assets}
                                        value={data.asset_id}
                                        onSelect={(value) => setData('asset_id', value)}
                                        placeholder="-- ค้นหาทรัพย์สิน --"
                                    />
                                    <InputError message={errors.asset_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maintenance_type_id">ประเภทงาน PM *</Label>
                                    <Select value={data.maintenance_type_id} onValueChange={(v) => setData('maintenance_type_id', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{pmTypes.map(type => <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <InputError message={errors.maintenance_type_id} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interval_days">ความถี่ (วัน) *</Label>
                                        <Input id="interval_days" type="number" min="1" value={data.interval_days} onChange={(e) => setData('interval_days', e.target.valueAsNumber)} />
                                        <InputError message={errors.interval_days} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ครั้งถัดไป *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !data.next_due_date && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.next_due_date ? format(data.next_due_date, "yyyy-MM-dd") : <span>เลือกวันที่</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={data.next_due_date} onSelect={(date) => setData('next_due_date', date)} initialFocus /></PopoverContent>
                                        </Popover>
                                        <InputError message={errors.next_due_date} />
                                    </div>
                                </div>

                                {/* ( [ใหม่] ช่อง Status) */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">สถานะ *</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v as 'active' | 'inactive')}>
                                        <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active (เปิดใช้งาน)</SelectItem>
                                            <SelectItem value="inactive">Inactive (ปิดใช้งาน)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

                                {/* (6. [ใหม่] เพิ่มส่วน Checklist) */}
                                <Separator />
                                <PlanTaskForm
                                    tasks={data.tasks}
                                    setData={setData}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <DangerButton type="button" onClick={() => setConfirmingDeletion(true)}>
                                    ลบแผนนี้
                                </DangerButton>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('maintenance.plans.index')}>ยกเลิก</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>บันทึกการเปลี่ยนแปลง</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </form>

                    {/* (Modal ยืนยันการลบ) */}
                    <Modal show={confirmingDeletion} onClose={() => setConfirmingDeletion(false)}>
                        <form onSubmit={deletePlan} className="p-6">
                            <h2 className="text-lg font-medium text-gray-900">ยืนยันการลบ</h2>
                            <p className="mt-1 text-sm text-gray-600">คุณแน่ใจหรือไม่ว่าต้องการลบแผน PM นี้?</p>
                            <div className="mt-6 flex justify-end">
                                <SecondaryButton type="button" onClick={() => setConfirmingDeletion(false)}>ยกเลิก</SecondaryButton>
                                <DangerButton className="ml-3" disabled={processing}>ยืนยันการลบ</DangerButton>
                            </div>
                        </form>
                    </Modal>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
