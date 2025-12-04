import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryNavigationMenu from '@/Pages/Inventory/Partials/InventoryNavigationMenu';

// (Import ShadCN & Icons)
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Boxes, Building, CircleDollarSign, ArchiveX } from 'lucide-react';

/* --- Types --- */
interface Props {
    stats: {
        totalItems: number;
        totalWarehouses: number;
        totalStockValue: number;
        itemsNoStock: number;
    };
}

// (Helper Component สำหรับ Stat Card)
const StatCard = ({ title, value, icon: Icon, colorClass, link }: any) => (
    <Card>
        <Link href={link}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${colorClass ?? 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Link>
    </Card>
);

// (Helper Format เงิน)
const formatCurrency = (value: number) =>
    value.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 });


export default function InventoryDashboard({ auth, stats }: PageProps & Props) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Inventory Overview
                </h2>
            }
            navigationMenu={<InventoryNavigationMenu />}
        >
            <Head title="Inventory Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* (KPI Grid) */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Stock Level"
                            value={stats.totalItems.toLocaleString()}
                            icon={Boxes}
                            colorClass="text-blue-500"
                            link={route('stock.index')}
                        />
                        <StatCard
                            title="Total Warehouses"
                            value={stats.totalWarehouses.toLocaleString()}
                            icon={Building}
                            colorClass="text-green-500"
                            link={route('warehouses.index')}
                        />
                        <StatCard
                            title="Total Stock Value"
                            value={formatCurrency(stats.totalStockValue)}
                            icon={CircleDollarSign}
                            colorClass="text-emerald-500"
                            link={route('stock.index')}
                        />
                        <StatCard
                            title="Items with No Stock"
                            value={stats.itemsNoStock.toLocaleString()}
                            icon={ArchiveX}
                            colorClass="text-red-500"
                            link={route('inventory.items.index')}
                        />
                    </div>

                    {/* (ในอนาคต: เพิ่ม Cards ที่คล้ายกับ Odoo) */}
                    {/* (เช่น "Receipts", "Delivery Orders" เมื่อเราสร้าง BCs เหล่านั้น) */}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
