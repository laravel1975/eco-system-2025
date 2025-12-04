import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Asset, PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';

// (Import Shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import InputError from '@/Components/InputError';
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar"; // (ต้อง add: npx shadcn-ui@latest add calendar)
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns'; // (ต้อง install: npm install date-fns)
import { MaintenanceType } from '@/types/maintenance';
import PlanTaskForm, { PlanTask } from './Partials/PlanTaskForm';
import { Separator } from '@/Components/ui/separator';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';
import { AssetCombobox } from '@/Components/AssetCombobox';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/
interface Props {
    assets: Asset[];
    pmTypes: MaintenanceType[];
}

interface PlanFormData {
    title: string;
    asset_id: string;
    maintenance_type_id: string;
    interval_days: number | string;
    next_due_date: Date | undefined;
    tasks: PlanTask[];
}

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function CreateMaintenancePlan({ auth, assets, pmTypes }: PageProps & Props) {

    const { data, setData, post, processing, errors, clearErrors } = useForm<PlanFormData>({
        title: '',
        asset_id: '',
        maintenance_type_id: '',
        interval_days: 30,
        next_due_date: undefined,
        tasks: [],
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('maintenance.plans.store'));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">สร้างแผน PM</h2>}
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="สร้างแผน PM" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">

                    <Breadcrumbs
                        links={[{ label: "แผน PM", href: route('maintenance.plans.index') }]}
                        activeLabel="สร้างใหม่"
                    />

                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลแผน PM ใหม่</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อแผน (เช่น ตรวจเช็คแอร์รายไตรมาส) *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                {/* Asset */}
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

                                {/* PM Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="maintenance_type_id">ประเภทงาน PM *</Label>
                                    <Select value={data.maintenance_type_id} onValueChange={(v) => setData('maintenance_type_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="-- ประเภทงาน PM --" /></SelectTrigger>
                                        <SelectContent>
                                            {pmTypes.map(type => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.maintenance_type_id} />
                                </div>

                                {/* Interval (Time-based) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interval_days">ความถี่ (ทุกๆ กี่วัน) *</Label>
                                        <Input
                                            id="interval_days"
                                            type="number"
                                            min="1"
                                            value={data.interval_days}
                                            onChange={(e) => setData('interval_days', e.target.valueAsNumber)}
                                        />
                                        <InputError message={errors.interval_days} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>วันที่เริ่มต้นครั้งถัดไป *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.next_due_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.next_due_date ? format(data.next_due_date, "yyyy-MM-dd") : <span>เลือกวันที่</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.next_due_date}
                                                    onSelect={(date) => setData('next_due_date', date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.next_due_date} />
                                    </div>
                                </div>

                                {/* (5. [ใหม่] เพิ่มส่วน Checklist) */}
                                <Separator />
                                <PlanTaskForm
                                    tasks={data.tasks}
                                    setData={setData}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />

                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('maintenance.plans.index')}>ยกเลิก</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>บันทึกแผน</Button>
                            </CardFooter>
                        </Card>
                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
