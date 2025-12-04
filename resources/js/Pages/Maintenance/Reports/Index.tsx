import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';
// ... (Import Shadcn Components & Icons) ...
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Components/ui/card';
import { AssetCombobox } from '@/Components/AssetCombobox'; // (Import)
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Clock, DollarSign, Search, User, Wrench } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Progress } from '@/Components/ui/progress';

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
interface MaintenanceTypeOption {
    id: number;
    name: string;
    code: string;
}
interface KpiData {
    total_labor_cost: number;
    total_spare_cost: number;
    total_maintenance_cost: number;
    mttr: number;
}
interface AssetCostData {
    id: number;
    asset_name: string;
    asset_code: string;
    total_cost: number;
    breakdown_count: number;
    mttr: number;
    mtbf: number;
}
interface Props {
    kpis: KpiData;
    assetCosts: AssetCostData[];
    assets: AssetOption[]; // (ใช้ Type ใหม่)
    maintenanceTypes: MaintenanceTypeOption[];
    filters: {
        start_date: string;
        end_date: string;
        asset_id?: string;
        maintenance_type_id?: string;
    };
}

// ... (Component) ...
export default function MaintenanceReport({ auth, kpis, assetCosts, assets, maintenanceTypes, filters }: PageProps & Props) {

    const { data, setData, get } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        asset_id: filters.asset_id || 'all',
        maintenance_type_id: filters.maintenance_type_id || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('maintenance.reports.index'), { preserveState: true });
    };

    // (Helper สำหรับ Format เงิน)
    const formatCurrency = (value: number) =>
        value.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 });

    const maxAssetCost = React.useMemo(() => {
        // (ดึงเฉพาะ 'total_cost' ทั้งหมดออกมา)
        const costs = assetCosts.map(asset => asset.total_cost);
        if (costs.length === 0) {
            return 1; // (ป้องกันการหารด้วย 0)
        }
        // (หาค่าสูงสุดใน Array)
        return Math.max(...costs);
    }, [assetCosts]); // (คำนวณใหม่เฉพาะเมื่อ 'assetCosts' เปลี่ยน)

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maintenance Report</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="Maintenance Report" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* 1. Filter Bar */}
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

                                {/* (2. 👈 [แก้ไข] Asset Combobox จะแสดง 'warehouse.name' อัตโนมัติ) */}
                                <div className="space-y-2 min-w-[200px]">
                                    <Label>ทรัพย์สิน (Asset)</Label>
                                    <AssetCombobox
                                        assets={assets}
                                        value={data.asset_id}
                                        onSelect={(v) => setData('asset_id', v || 'all')}
                                        placeholder="เครื่องจักรทั้งหมด"
                                    />
                                </div>

                                {/* ... (Maintenance Type Filter) ... */}
                                <div className="space-y-2 min-w-[200px]">
                                    <Label>ประเภทงานซ่อม</Label>
                                    <Select value={data.maintenance_type_id} onValueChange={(v) => setData('maintenance_type_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="ทั้งหมด" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทั้งหมด</SelectItem>
                                            {maintenanceTypes.map(type => (
                                                <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit"><Search className="mr-2 h-4 w-4" /> ค้นหา</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* --- 1. KPI Cards (ปรับโฉมใหม่) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Card 1: Total Cost */}
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.total_maintenance_cost)}</div>
                                <p className="text-xs text-gray-500 mt-1">รวมค่าแรงและค่าอะไหล่</p>
                            </CardContent>
                        </Card>

                        {/* Card 2: Labor Cost */}
                        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Labor Cost</CardTitle>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.total_labor_cost)}</div>
                            </CardContent>
                        </Card>

                        {/* Card 3: Spare Part Cost */}
                        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Parts Cost</CardTitle>
                                <div className="p-2 bg-orange-100 rounded-full">
                                    <Wrench className="h-4 w-4 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.total_spare_cost)}</div>
                            </CardContent>
                        </Card>

                        {/* Card 4: MTTR */}
                        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">MTTR</CardTitle>
                                <div className="p-2 bg-rose-100 rounded-full">
                                    <Clock className="h-4 w-4 text-rose-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">
                                    {kpis.mttr} <span className="text-sm font-normal text-gray-500">ชม.</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">เวลาเฉลี่ยซ่อมเสร็จ</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- 2. Charts & Tables Section --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

                        {/* --- Table: Cost Analysis --- */}
                        <Card className="col-span-1 flex flex-col shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <DollarSign className="h-5 w-5 text-emerald-500" />
                                    Cost by Asset (Top 10)
                                </CardTitle>
                                <CardDescription>เครื่องจักรที่มีค่าใช้จ่ายสูงสุด</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto">
                                {assetCosts.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="w-[35%]">Asset</TableHead>
                                                <TableHead className="text-right w-[35%]">Total Cost</TableHead>
                                                <TableHead className="text-right w-[10%] text-xs">Breaks</TableHead>
                                                <TableHead className="text-right w-[10%] text-xs">MTTR</TableHead>
                                                <TableHead className="text-right w-[10%] text-xs">MTBF</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assetCosts.map((asset) => (
                                                <TableRow key={asset.id} className="hover:bg-slate-50">
                                                    <TableCell>
                                                        <div className="font-semibold text-sm text-gray-900">{asset.asset_code}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={asset.asset_name}>
                                                            {asset.asset_name}
                                                        </div>
                                                    </TableCell>
                                                    {/* (6. 👈 [แก้ไข] นี่คือส่วนที่ Error) */}
                                                    <TableCell>
                                                        <div className="font-mono text-xs">
                                                            {/* (ลบ <font> ที่ผิดออก) */}
                                                            {formatCurrency(asset.total_cost)}
                                                        </div>
                                                        <Progress
                                                            // (ใช้ 'maxAssetCost' ที่เราเพิ่งสร้าง)
                                                            value={(asset.total_cost / maxAssetCost) * 100}
                                                            className="h-1.5 mt-1"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-right text-sm">{asset.breakdown_count}</TableCell>

                                                    <TableCell className="text-right font-mono text-xs text-red-600">
                                                        {asset.mttr > 0 ? asset.mttr : '-'}
                                                    </TableCell>

                                                    <TableCell className="text-right font-mono text-xs text-emerald-600">
                                                        {asset.mtbf > 0 ? asset.mtbf.toLocaleString() : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-gray-400 py-10">
                                        <p>ยังไม่มีข้อมูลค่าใช้จ่าย</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
