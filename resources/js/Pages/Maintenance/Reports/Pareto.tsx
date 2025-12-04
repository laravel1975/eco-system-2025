import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Components/ui/card';
import { AlertTriangle, BarChart3, Search } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { AssetCombobox } from '@/Components/AssetCombobox';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

/* --- Types --- */

// (1. 👈 [แก้ไข] Type ของ AssetOption)
interface AssetOption {
    id: number;
    name: string;
    asset_code: string;
    // (ลบ 'location' เก่า)
    // location: string | null;
    // (เพิ่ม 'warehouse' Relation ใหม่)
    warehouse: { uuid: string; name: string; } | null;
}
interface Props {
    rootCauses: {
        name: string;
        full_name: string;
        count: number;
        fill: string;
        cumulativePercentage: number;
    }[];
    assets: AssetOption[]; // (ใช้ Type ใหม่)
    filters: {
        start_date: string;
        end_date: string;
        asset_id: string | null;
    };
}

// ... (CustomTooltip - เหมือนเดิม) ...
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-gray-900 mb-1">{data.full_name}</p>
                <p className="text-gray-600">Code: <span className="font-mono">{data.name}</span></p>
                <div className="mt-2 space-y-1">
                    <p className="text-indigo-600 font-medium">จำนวน: {data.count} ครั้ง</p>
                    <p className="text-orange-500 font-medium">% สะสม: {data.cumulativePercentage}%</p>
                </div>
            </div>
        );
    }
    return null;
};


/* --- Component --- */
export default function ParetoReport({ auth, rootCauses, assets, filters }: PageProps & Props) {

    const { data, setData, get } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        asset_id: filters.asset_id || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('maintenance.reports.pareto'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงาน Pareto (RCA)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Pareto Analysis" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* --- Filter Bar --- */}
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                                {/* ... (Date Filters) ... */}
                                <div className="space-y-2">
                                    <Label>ตั้งแต่วันที่</Label>
                                    <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>ถึงวันที่</Label>
                                    <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                </div>

                                {/* (2. 👈 [ไม่ต้องแก้ไข] Combobox นี้จะใช้ Type ใหม่โดยอัตโนมัติ) */}
                                <div className="space-y-2 min-w-[200px]">
                                    <Label>ทรัพย์สิน (Asset)</Label>
                                    <AssetCombobox assets={assets} value={data.asset_id} onSelect={(v) => setData('asset_id', v || 'all')} placeholder="ทั้งหมด" />
                                </div>
                                <Button type="submit"><Search className="mr-2 h-4 w-4" /> ค้นหา</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* --- Chart: Pareto Analysis --- */}
                    <Card className="col-span-1 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertTriangle className="h-5 w-5 text-indigo-500" />
                                Pareto Analysis (Root Causes)
                            </CardTitle>
                            <CardDescription>วิเคราะห์สาเหตุการเสีย (80/20 Rule)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] w-full pl-0">
                            {rootCauses.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={rootCauses}
                                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" fontSize={11} tick={{ dy: 10 }} />

                                        {/* แกนซ้าย (จำนวน) */}
                                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" fontSize={12} />

                                        {/* แกนขวา (%) */}
                                        <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} unit="%" domain={[0, 100]} />

                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />

                                        <Bar yAxisId="left" dataKey="count" name="Frequency" radius={[4, 4, 0, 0]} barSize={30} fill="#6366f1" />

                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="cumulativePercentage"
                                            name="Cumulative %"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                    <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
                                    <p>ยังไม่มีข้อมูล Root Cause</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
