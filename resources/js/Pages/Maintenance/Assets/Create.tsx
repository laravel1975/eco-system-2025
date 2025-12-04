import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { AssetFormData, PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import AssetForm from './Partials/AssetForm';
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

/**
 * (1. 👈 [ใหม่] Type สำหรับ List Warehouse ที่รับมาจาก Controller)
 */
interface WarehouseOption {
    uuid: string;
    name: string;
    code: string;
}

/**
 * (2. 👈 [แก้ไข] รับ 'warehouses' prop จาก AssetController@create)
 */
export default function CreateAsset({ auth, warehouses }: PageProps & { warehouses: WarehouseOption[] }) {

    /**
     * (3. 👈 [แก้ไข] แก้ไข useForm)
     */
    const { data, setData, post, processing, errors } = useForm<AssetFormData>({
        name: '',
        asset_code: '',
        description: '', // (แก้จาก null)
        // location: null, // (ลบ field เก่า)
        warehouse_uuid: '', // (เพิ่ม field ใหม่ และใช้ '')
        model_number: '', // (แก้จาก null)
        serial_number: '', // (แก้จาก null)
        purchase_date: '', // (แก้จาก null)
        warranty_end_date: '', // (แก้จาก null)
        status: 'active',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('maintenance.assets.store'));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">สร้างทรัพย์สินใหม่</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="สร้างทรัพย์สินใหม่" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <AssetForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    warehouses={warehouses} // (4. 👈 [ส่ง] prop ลงไปใน Form)
                                />
                            </div>
                            <div className="flex items-center justify-end gap-4 px-6 py-4 bg-gray-50 border-t">
                                <Link
                                    href={route('maintenance.assets.index')}
                                    as="button"
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    ยกเลิก
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    บันทึกข้อมูล
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
