import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { FileDown, Search } from 'lucide-react';

// (Recharts)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* --- Types --- */
interface Technician { id: number; first_name: string; last_name: string; }
interface ChartData { name: string; jobs: number; hours: number; p1: number; p2: number; }
interface Props {
    technicians: Technician[];
    chartData: ChartData[];
    filters: { technician_id: string; start_date: string; end_date: string; };
}

export default function TechnicianReport({ auth, technicians, chartData, filters }: PageProps & Props) {

    const { data, setData, get } = useForm({
        technician_id: filters.technician_id || 'all',
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('maintenance.reports.technician'));
    };

    const handleExport = () => {
        // (เปิด Tab ใหม่เพื่อโหลด PDF)
        const query = new URLSearchParams(data as any).toString();
        window.open(route('maintenance.reports.technician.pdf') + '?' + query, '_blank');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงานประสิทธิภาพช่าง (Technician KPI)</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Technician KPI" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* 1. Filter Bar */}
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2 w-64">
                                    <Label>เลือกช่าง (Technician)</Label>
                                    <Select value={data.technician_id} onValueChange={(v) => setData('technician_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="ทั้งหมด" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทั้งหมด</SelectItem>
                                            {technicians.map(t => (
                                                <SelectItem key={t.id} value={String(t.id)}>{t.first_name} {t.last_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>ตั้งแต่วันที่</Label>
                                    <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>ถึงวันที่</Label>
                                    <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                </div>
                                <Button type="submit"><Search className="mr-2 h-4 w-4" /> ค้นหา</Button>
                                <Button type="button" variant="outline" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" /> Export PDF</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* 2. Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        {/* กราฟ 1: จำนวนงาน vs ชั่วโมงงาน */}
                        <Card>
                            <CardHeader><CardTitle>ปริมาณงาน (Jobs vs Hours)</CardTitle></CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="jobs" name="จำนวนงาน" fill="#8884d8" />
                                        <Bar yAxisId="right" dataKey="hours" name="ชั่วโมงทำงาน" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* กราฟ 2: ความสำคัญของงาน (P1/P2) */}
                        <Card>
                            <CardHeader><CardTitle>งานเร่งด่วน (Emergency/Urgent)</CardTitle></CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="p1" name="P1 (Emergency)" stackId="a" fill="#ef4444" />
                                        <Bar dataKey="p2" name="P2 (Urgent)" stackId="a" fill="#f97316" />
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
