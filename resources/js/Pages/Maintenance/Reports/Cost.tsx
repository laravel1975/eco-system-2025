import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { Search, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* --- Types --- */
interface ChartData { name: string; laborCost: number; partsCost: number; }
interface Props {
    availableYears: number[];
    chartData: ChartData[];
    filters: { year: number; month: string; };
}

// (Helper: สร้าง Array 12 เดือน)
const months = [
    { value: 'all', label: 'All Months' },
    ...Array.from({ length: 12 }, (v, k) => ({
        value: String(k + 1),
        label: new Date(2000, k, 1).toLocaleString('en-US', { month: 'long' }) // (ใช้ปี 2000 แค่เพื่อดึงชื่อเดือน)
    }))
];

// (Helper: Tooltip กราฟ)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-gray-900 mb-1">
                    {/* (แสดงชื่อเดือน หรือ วันที่) */}
                    {payload[0].payload.monthKey ? label : `วันที่ ${label}`}
                </p>
                <p style={{ color: '#8884d8' }}>Labor Cost: {payload[0].value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
                <p style={{ color: '#82ca9d' }}>Parts Cost: {payload[1].value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</p>
            </div>
        );
    }
    return null;
};

export default function CostReport({ auth, availableYears, chartData, filters }: PageProps & Props) {

    const { data, setData, get } = useForm({
        year: String(filters.year),
        month: filters.month || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('maintenance.reports.cost'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงานต้นทุน (Cost Trend)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Cost Trend Report" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* 1. Filter Bar */}
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2 w-48">
                                    <Label>เลือกปี (Year)</Label>
                                    <Select value={data.year} onValueChange={(v) => setData('year', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {availableYears.map(y => (
                                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 w-48">
                                    <Label>เลือกเดือน (Month)</Label>
                                    <Select value={data.month} onValueChange={(v) => setData('month', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {months.map(m => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit"><Search className="mr-2 h-4 w-4" /> ค้นหา</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* 2. Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-gray-500" />
                                Cost Trend (Labor vs Parts)
                            </CardTitle>
                            <CardDescription>
                                เปรียบเทียบต้นทุนค่าแรง และค่าอะไหล่
                                {filters.month === 'all' ? ` ประจำปี ${filters.year}` : ` ประจำเดือน ${months.find(m => m.value === filters.month)?.label} ${filters.year}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis
                                            fontSize={12}
                                            tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="laborCost" name="Labor Cost" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="partsCost" name="Parts Cost" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    <p>ไม่มีข้อมูลในช่วงเวลาที่เลือก</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
