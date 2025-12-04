import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Search, BarChart3, Clock, PieChart as PieIcon, Zap } from 'lucide-react';

// (Import PieChart และ BarChart)
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';

// (1. [ใหม่] Import AssetCombobox)
import { AssetCombobox } from '@/Components/AssetCombobox';

/* --- Types --- */
interface AssetOption { id: number; name: string; asset_code: string; location: string | null; } // (เพิ่ม)
interface FreqData { name: string; count: number; fill: string; }
interface DurationData { name: string; hours: number; fill: string; }
interface AvailabilityData { name: string; value: number; fill: string; }

interface Props {
    freqData: FreqData[];
    durationData: DurationData[];
    availabilityData: AvailabilityData[];
    availabilityPercentage: number;
    assets: AssetOption[]; // (เพิ่ม)
    filters: { start_date: string; end_date: string; asset_id: string | null; }; // (เพิ่ม)
}

// (Helper: Label กราฟวงกลม - เหมือนเดิม)
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function DowntimeReport({ auth, freqData, durationData, availabilityData, availabilityPercentage, filters, assets }: PageProps & Props) {

    // (2. [อัปเกรด] useForm เพิ่ม asset_id)
    const { data, setData, get } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        asset_id: filters.asset_id || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('maintenance.reports.downtime'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงาน Downtime เครื่องจักร</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Downtime Report" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* 1. [อัปเกรด] Filter Bar */}
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>ตั้งแต่วันที่</Label>
                                    <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>ถึงวันที่</Label>
                                    <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                </div>

                                {/* (3. 👈 [แก้ไข] Asset Filter) */}
                                <div className="space-y-2 min-w-[200px]">
                                    <Label>ทรัพย์สิน (Asset)</Label>
                                    {/* (เราต้องอัปเดต AssetCombobox ให้แสดง 'warehouse.name' แทน 'location') */}
                                    <AssetCombobox
                                        assets={assets}
                                        value={data.asset_id}
                                        onSelect={(v) => setData('asset_id', v || 'all')}
                                        placeholder="เครื่องจักรทั้งหมด"
                                    />
                                </div>

                                <Button type="submit"><Search className="mr-2 h-4 w-4" /> ค้นหา</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* 2. Availability Chart (Pie Chart) - เหมือนเดิม */}
                    <Card className="col-span-1 lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Zap className="h-5 w-5 text-green-500" />
                                Overall Availability
                            </CardTitle>
                            <CardDescription>
                                ภาพรวมความพร้อมใช้งานของเครื่องจักร (Uptime vs Downtime)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex flex-col md:flex-row items-center p-4">
                            {/* (ส่วนตัวเลข KPI) */}
                            <div className="flex-1 text-center md:text-left mb-4 md:mb-0 space-y-2">
                                <p className="text-sm text-muted-foreground">Overall Availability %</p>
                                <p className="text-5xl font-bold text-green-600">{availabilityPercentage}%</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    (Total Uptime: {availabilityData[0].value.toLocaleString()} ชม. /
                                    Total Downtime: {availabilityData[1].value.toLocaleString()} ชม.)
                                </p>
                            </div>

                            {/* (ส่วน Pie Chart) */}
                            <div className="w-full md:w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={availabilityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {availabilityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value.toLocaleString()} ชม.`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. [ใหม่] เพิ่มกราฟแท่ง 2 อันนี้กลับเข้ามา */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* กราฟ 1: Top 10 เครื่องจักรที่หยุดบ่อย (Frequency) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <BarChart3 className="h-5 w-5 text-red-500" />
                                    Top 10 Breakdown Frequency
                                </CardTitle>
                                <CardDescription>เครื่องจักรที่หยุดทำงานบ่อยที่สุด (นับตามจำนวนครั้ง)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={freqData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                        <Tooltip cursor={{ fill: '#fef2f2' }} />
                                        <Bar dataKey="count" name="จำนวนครั้ง" radius={[0, 4, 4, 0]}>
                                            {freqData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* กราฟ 2: Top 10 เครื่องจักรที่หยุดนาน (Duration) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    Top 10 Downtime Duration
                                </CardTitle>
                                <CardDescription>เครื่องจักรที่ใช้เวลาหยุดทำงาน (รวม) นานที่สุด</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={durationData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" unit=" ชม." />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                        <Tooltip cursor={{ fill: '#fff7ed' }} formatter={(value) => `${value} ชม.`} />
                                        <Bar dataKey="hours" name="ชั่วโมงรวม" radius={[0, 4, 4, 0]}>
                                            {durationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
