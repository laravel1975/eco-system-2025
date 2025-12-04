import React from 'react';
import NavLink from '@/Components/NavLink';
import { usePage } from '@inertiajs/react';

export default function WarehouseNavigationMenu() {
    // (ใช้ usePage() เพื่อตรวจสอบว่า Route ปัจจุบันคืออะไร)
    const { component } = usePage();

    // (Helper เพื่อกำหนด Active State)
    const isInventoryModule = component.startsWith('Warehouse/');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16">
                <div className="flex space-x-8">
                    {/* (ลิงก์ไปยังหน้า Dashboard (สมมติ)) */}
                    <NavLink
                        href="#" // (อาจจะเปลี่ยนเป็น dashboard)
                        active={component === 'Warehouse/Dashboard'}
                    >
                        Dashboard
                    </NavLink>

                    {/* (ลิงก์ไปยังหน้า List ที่เราเพิ่งสร้าง) */}
                    <NavLink
                        href={route('warehouses.index')}
                        active={component === 'Warehouse/Index'} // (ให้ Active ถ้าอยู่ใน Warehouse/)
                    >
                        Warehouses
                    </NavLink>

                    {/* (ลิงก์อื่นๆ ในอนาคต) */}
                    <NavLink
                        href={'#'}
                        active={component === 'Warehouse/Reports'}>
                        Reports
                    </NavLink>
                </div>
            </div>
        </div>
    );
}
