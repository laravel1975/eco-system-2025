import React from 'react';
import { Link } from '@inertiajs/react'; // (หรือ import Link from 'next/link')
import { Card } from "@/Components/ui/card";
import { AspectRatio } from "@/Components/ui/aspect-ratio";

// (Import Icons ที่เราจะใช้)
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    HardHat,
    Settings,
    Warehouse,
    ShoppingCart,
    Package,
    Flag
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| 1. Type Definition
|--------------------------------------------------------------------------
| กำหนด Type สำหรับ App แต่ละตัว
*/
interface AppItemProps {
    href: string;
    label: string;
    Icon: React.ElementType; // (รับ Component Icon)
    colorClasses: string;    // (รับ Class สีสำหรับพื้นหลังไอคอน)
}

/*
|--------------------------------------------------------------------------
| 2. App List
|--------------------------------------------------------------------------
| สร้างรายการ App ทั้งหมด (อ้างอิงจากเมนูของคุณและในภาพ)
*/
const apps: AppItemProps[] = [
    {
        href: route('dashboard'), // (สมมติว่าคุณใช้ Ziggy)
        label: 'Dashboards',
        Icon: LayoutDashboard,
        colorClasses: 'bg-teal-500 text-white',
    },
    {
        href: '#',
        label: 'Calendar',
        Icon: CalendarDays,
        colorClasses: 'bg-orange-400 text-white',
    },
    {
        href: route('maintenance.work-orders.index'),
        label: 'Maintenance',
        Icon: HardHat,
        colorClasses: 'bg-blue-500 text-white',
    },
    {
        href: route('hrm.employees.index'),
        label: 'Employees',
        Icon: Users,
        colorClasses: 'bg-cyan-500 text-white',
    },
    {
        href: route('hrm.attendances.index'),
        label: 'Attendances',
        Icon: Flag,
        colorClasses: 'bg-indigo-500 text-white',
    },
    {
        href: '#',
        label: 'Inventory',
        Icon: Warehouse,
        colorClasses: 'bg-purple-500 text-white',
    },
    {
        href: '#',
        label: 'Purchase',
        Icon: ShoppingCart,
        colorClasses: 'bg-pink-500 text-white',
    },
    {
        href: '#',
        label: 'Stock',
        Icon: Package,
        colorClasses: 'bg-green-500 text-white',
    },
    {
        href: '#',
        label: 'Settings',
        Icon: Settings,
        colorClasses: 'bg-gray-600 text-white',
    },
    // ... (เพิ่ม App อื่นๆ ที่นี่)
];

/*
|--------------------------------------------------------------------------
| 3. React Component (Application Panel)
|--------------------------------------------------------------------------
*/
export default function ApplicationPanel() {
    return (
        <div className="p-4 sm:p-8">
            {/* (วาง Grid ให้อยู่กึ่งกลาง) */}
            <div className="max-w-6xl mx-auto">

                {/* (Grid ที่ Responsive) */}
                <div className="grid
                    grid-cols-2
                    sm:grid-cols-4
                    md:grid-cols-5
                    lg:grid-cols-6
                    xl:grid-cols-8
                    gap-4 sm:gap-6"
                >
                    {/* (วนลูปสร้าง App Card) */}
                    {apps.map((app) => (
                        <Link href={app.href} key={app.label}>
                            <Card className="rounded-xl shadow-sm
                                           hover:shadow-lg
                                           transition-all duration-200 ease-in-out
                                           cursor-pointer group"
                            >
                                {/* (บังคับสี่เหลี่ยมจัตุรัส) */}
                                <AspectRatio
                                    ratio={1 / 1}
                                    className="p-4 flex flex-col items-center justify-center"
                                >
                                    {/* (Icon Container) */}
                                    <div
                                        className={`h-14 w-14 rounded-lg flex items-center justify-center
                                                    ${app.colorClasses}
                                                    transition-transform duration-200 group-hover:scale-110`}
                                    >
                                        <app.Icon className="h-7 w-7" />
                                    </div>

                                    {/* (Label) */}
                                    <span className="mt-3 text-sm font-medium text-center text-gray-700">
                                        {app.label}
                                    </span>
                                </AspectRatio>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
