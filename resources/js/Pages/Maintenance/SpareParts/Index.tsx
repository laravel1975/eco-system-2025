import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PaginatedResponse, SparePart } from '@/types/maintenance';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions
|--------------------------------------------------------------------------
*/

interface Props {
    spareParts: PaginatedResponse<SparePart>;
    filters: {
        search: string | null;
        filter: string | null; // (สำหรับ 'low_stock')
    };
}

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function SparePartIndex({ auth, spareParts, filters }: PageProps & Props) {

    // (เพิ่มตัวแปรมารับค่า filter ที่ถูกต้อง)
    const validFilters = ['low_stock'];
    const currentFilter = (filters.filter && validFilters.includes(filters.filter))
        ? filters.filter
        : '';

    // (Filter Form)
    const { data, setData, get } = useForm({
        search: filters.search || '',
        filter: currentFilter, // (ใช้ตัวแปรใหม่นี้)
    });

    // (ฟังก์ชันค้นหา)
    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        get(route('maintenance.spare-parts.index'), {
            preserveState: true,
            replace: true,
        });
    }

    // (Helper: ตรวจสอบ Low Stock)
    const isLowStock = (part: SparePart) => {
        return part.reorder_level && part.stock_quantity <= part.reorder_level;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการอะไหล่ (Spare Parts)</h2>}
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="จัดการอะไหล่" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {/* (Filter Bar และ ปุ่มสร้าง) */}
                            <div className="flex justify-between items-center mb-4">
                                <form onSubmit={handleSearch} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="ค้นหา (ชื่อ, รหัส)..."
                                    />
                                    <select
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={data.filter}
                                        onChange={(e) => setData('filter', e.target.value)}
                                    >
                                        <option value="">ทั้งหมด</option>
                                        <option value="low_stock">สต็อกเหลือน้อย</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                                    >
                                        ค้นหา
                                    </button>
                                </form>

                                <Link
                                    href={route('maintenance.spare-parts.create')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                >
                                    + สร้างอะไหล่ใหม่
                                </Link>
                            </div>

                            {/* (ตาราง) */}
                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b">
                                        <tr className="text-left font-bold">
                                            <th className="px-6 py-3">รหัสอะไหล่</th>
                                            <th className="px-6 py-3">ชื่อ</th>
                                            <th className="px-6 py-3">สต็อก</th>
                                            <th className="px-6 py-3">ตำแหน่ง</th>
                                            <th className="px-6 py-3">ดำเนินการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {spareParts.data.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลอะไหล่</td></tr>
                                        )}
                                        {spareParts.data.map((part) => (
                                            <tr key={part.id} className="hover:bg-gray-100 border-b">
                                                <td className="px-6 py-4">{part.part_number}</td>
                                                <td className="px-6 py-4">{part.name}</td>
                                                <td className={`px-6 py-4 ${isLowStock(part) ? 'text-red-600 font-bold' : ''}`}>
                                                    {part.stock_quantity}
                                                    {isLowStock(part) && ' (Low!)'}
                                                </td>
                                                <td className="px-6 py-4">{part.location || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('maintenance.spare-parts.show', part.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        ดู
                                                    </Link>
                                                    <Link
                                                        href={route('maintenance.spare-parts.edit', part.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        แก้ไข
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* (Pagination - (ควรย้ายไป Component กลาง)) */}
                            <div className="mt-4">
                                <div className="flex flex-wrap -mb-1">
                                    {spareParts.meta?.total > 0 && spareParts.links.map((link, index) => (
                                        <Link
                                            key={index} href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded ${link.active ? 'bg-indigo-500 text-white' : 'bg-white'} ${!link.url ? '!text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                            as="button" disabled={!link.url}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
