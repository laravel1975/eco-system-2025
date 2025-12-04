import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { AssetFormData, PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AssetForm from './Partials/AssetForm';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/**
 * (1. 👈 [ใหม่] Type สำหรับ List Warehouse)
 */
interface WarehouseOption {
    uuid: string;
    name: string;
    code: string;
}

/**
 * (2. 👈 [แก้ไข] Type ของ Asset ที่รับมา)
 */
interface Asset {
    id: number;
    name: string;
    asset_code: string;
    description: string | null;
    // location: string | null; // (ลบ field เก่า)
    warehouse_uuid: string | null; // (เพิ่ม field ใหม่)
    model_number: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    warranty_end_date: string | null;
    status: string;
}

/**
 * (3. 👈 [แก้ไข] รับ 'warehouses' prop)
 */
interface Props {
    asset: Asset;
    warehouses: WarehouseOption[];
}

export default function EditAsset({ auth, asset, warehouses }: PageProps & Props) {

    /**
     * (4. 👈 [แก้ไข] แก้ไข useForm)
     */
    const { data, setData, patch, processing, errors, delete: destroy } = useForm<AssetFormData>({
        name: asset.name,
        asset_code: asset.asset_code,
        description: asset.description || '', // (แก้จาก null)
        // location: asset.location || null, // (ลบ field เก่า)
        warehouse_uuid: asset.warehouse_uuid || '', // (เพิ่ม field ใหม่ และใช้ '')
        model_number: asset.model_number || '', // (แก้จาก null)
        serial_number: asset.serial_number || '', // (แก้จาก null)
        purchase_date: asset.purchase_date, // (ใช้ค่าเดิม (null) ได้ เพราะ AssetForm มี Helper)
        warranty_end_date: asset.warranty_end_date, // (ใช้ค่าเดิม (null) ได้)
        status: asset.status,
    });

    // ... (ฟังก์ชัน Modal และ Delete เหมือนเดิม) ...
    const [confirmingAssetDeletion, setConfirmingAssetDeletion] = useState(false);
    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        patch(route('maintenance.assets.update', asset.id));
    }
    const confirmAssetDeletion = () => { setConfirmingAssetDeletion(true); };
    const closeModal = () => { setConfirmingAssetDeletion(false); };
    const deleteAsset = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        destroy(route('maintenance.assets.destroy', asset.id), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">แก้ไขทรัพย์สิน: {asset.name}</h2>}
            navigationMenu={<MaintenanceNavigationMenu/>}
        >
            <Head title={`แก้ไข ${asset.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <AssetForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    warehouses={warehouses} // (5. 👈 [ส่ง] prop ลงไปใน Form)
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t">
                                {/* (ปุ่ม Delete - เหมือนเดิม) */}
                                <DangerButton
                                    type="button"
                                    onClick={confirmAssetDeletion}
                                    disabled={processing}
                                >
                                    ลบข้อมูล
                                </DangerButton>
                                {/* (ปุ่ม Cancel/Save - เหมือนเดิม) */}
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={route('maintenance.assets.index')}
                                        as="button"
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        ยกเลิก
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        บันทึกการเปลี่ยนแปลง
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* (Modal ยืนยันการลบ - เหมือนเดิม) */}
            <Modal show={confirmingAssetDeletion} onClose={closeModal}>
                <form onSubmit={deleteAsset} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        ยืนยันการลบข้อมูล
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        คุณแน่ใจหรือไม่ว่าต้องการลบทรัพย์สินนี้ ({asset.name})?
                        ข้อมูลนี้ไม่สามารถกู้คืนได้
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>
                            ยกเลิก
                        </SecondaryButton>
                        <DangerButton className="ml-3" disabled={processing}>
                            ยืนยันการลบ
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
