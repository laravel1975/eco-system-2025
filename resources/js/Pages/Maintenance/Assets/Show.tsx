import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs'; // (Import Component ใหม่ของเรา)
import PrimaryButton from '@/Components/PrimaryButton';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions (TypeScript)
|--------------------------------------------------------------------------
*/

// (Type เหล่านี้ควรจะย้ายไป @/types/index.d.ts เพื่อใช้ร่วมกัน)
interface WorkOrder {
    id: number;
    work_order_code: string;
    status: string;
    description: string;
    maintenance_type: { name: string };
    created_at: string; // (เราจะ Format ทีหลัง)
}

interface Asset {
    id: number;
    name: string;
    asset_code: string;
    description: string | null;
    location: string | null;
    model_number: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    warranty_end_date: string | null;
    status: string;

    // (Relation ที่เรา load มาจาก Controller)
    work_orders: WorkOrder[];
    maintenance_requests: any[]; // (คุณสามารถกำหนด Type นี้ได้เช่นกัน)
}

// ( [ใหม่] Type สำหรับ Pager ... / ...)
interface PaginationInfo {
    current_index: number;
    total: number;
    next_asset_id: number | null;
    prev_asset_id: number | null;
}

// ( [ใหม่] เพิ่ม paginationInfo เข้าไปใน Props)
interface Props {
    asset: Asset;
    paginationInfo: PaginationInfo;
}

/*
|--------------------------------------------------------------------------
| 2. Helper Functions
|--------------------------------------------------------------------------
*/

// ( [ใหม่] ฟังก์ชันสำหรับ Format วันที่ เพื่อแก้ Console Warning)
const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '-';
    // (Input คือ "2025-10-30T17:00:00.000000Z")
    // (Output คือ "2025-10-30")
    try {
        return dateString.split('T')[0];
    } catch (e) {
        return dateString; // (กันเหนียว)
    }
};

// (Helper Function สำหรับแสดงผล)
const DetailItem = ({ label, value }: { label: string, value: any }) => (
    <div className="py-3 sm:py-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
);

/*
|--------------------------------------------------------------------------
| 3. React Component: Show Asset
|--------------------------------------------------------------------------
*/
export default function ShowAsset({ auth, asset, paginationInfo }: PageProps & Props) {

    // (SVG Icons สำหรับ Pager)
    const ChevronLeftIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    );
    const ChevronRightIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายละเอียดทรัพย์สิน</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title={asset.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* ( [ใหม่] ส่วน Header พร้อม Pager) */}
                    <div className="flex justify-between items-center mb-4">
                        {/* (1.) Breadcrumbs */}
                        <Breadcrumbs
                            links={[
                                { label: "จัดการทรัพย์สิน", href: route('maintenance.assets.index') }
                            ]}
                            activeLabel={asset.name}
                        />

                        {/* (2.) Pager (... / ...) */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                {paginationInfo.current_index} / {paginationInfo.total}
                            </span>
                            <Link
                                href={paginationInfo.prev_asset_id ? route('maintenance.assets.show', paginationInfo.prev_asset_id) : '#'}
                                as="button"
                                disabled={!paginationInfo.prev_asset_id}
                                className="p-1.5 rounded-md bg-white border shadow-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                preserveScroll // (ไม่เลื่อนหน้าจอ)
                            >
                                <ChevronLeftIcon />
                            </Link>
                            <Link
                                href={paginationInfo.next_asset_id ? route('maintenance.assets.show', paginationInfo.next_asset_id) : '#'}
                                as="button"
                                disabled={!paginationInfo.next_asset_id}
                                className="p-1.5 rounded-md bg-white border shadow-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                preserveScroll // (ไม่เลื่อนหน้าจอ)
                            >
                                <ChevronRightIcon />
                            </Link>
                        </div>
                    </div>
                    {/* (สิ้นสุดส่วน Header) */}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">

                        {/* (2.) Header (ชื่อ และ ปุ่มแก้ไข) */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{asset.name}</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">{asset.asset_code}</p>
                            </div>
                            <Link href={route('maintenance.assets.edit', asset.id)}>
                                <PrimaryButton>แก้ไขข้อมูล</PrimaryButton>
                            </Link>
                        </div>

                        {/* (3.) รายละเอียด (2 คอลัมน์) */}
                        <div className="p-6">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <DetailItem label="ตำแหน่ง" value={asset.location} />
                                <DetailItem label="สถานะ" value={asset.status} />
                                <DetailItem label="Serial Number" value={asset.serial_number} />
                                <DetailItem label="Model Number" value={asset.model_number} />
                                <DetailItem label="วันที่ซื้อ" value={formatDateForDisplay(asset.purchase_date)} />
                                <DetailItem label="วันที่หมดประกัน" value={formatDateForDisplay(asset.warranty_end_date)} />
                                <div className="md:col-span-2">
                                    <DetailItem label="คำอธิบาย" value={asset.description} />
                                </div>
                            </dl>
                        </div>

                        {/* (4.) ประวัติการซ่อม (Work Orders) */}
                        <div className="p-6 border-t">
                            <h4 className="text-md font-medium text-gray-900 mb-4">ประวัติการซ่อม (Work Orders)</h4>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left text-sm font-semibold text-gray-600 p-2">รหัส</th>
                                        <th className="text-left text-sm font-semibold text-gray-600 p-2">ประเภท</th>
                                        <th className="text-left text-sm font-semibold text-gray-600 p-2">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asset.work_orders.length === 0 && (
                                        <tr><td colSpan={3} className="p-2 text-center text-gray-500">ไม่พบประวัติ</td></tr>
                                    )}
                                    {asset.work_orders.map(wo => (
                                        <tr key={wo.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{wo.work_order_code}</td>
                                            <td className="p-2">{wo.maintenance_type.name}</td>
                                            <td className="p-2">{wo.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
