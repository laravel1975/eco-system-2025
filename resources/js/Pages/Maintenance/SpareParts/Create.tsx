import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SparePartForm, { SparePartFormData } from './Partials/SparePartForm'; // (1. 👈 [แก้ไข] Import Type)
import MaintenanceNavigationMenu from '../Partials/MaintenanceNavigationMenu';

// (2. 👈 [ใหม่] Type สำหรับ List Item)
interface ItemOption {
    uuid: string;
    name: string;
    part_number: string;
}

// (3. 👈 [แก้ไข] รับ 'items' prop)
export default function CreateSparePart({ auth, items }: PageProps & { items: ItemOption[] }) {

    // (4. 👈 [แก้ไข] แก้ไข useForm)
    const { data, setData, post, processing, errors } = useForm<SparePartFormData>({
        name: '',
        part_number: '',
        description: '', // (แก้จาก null)
        item_uuid: '', // (แก้จาก null)

        // (ลบ field เก่า)
        // location: null,
        // unit_cost: '',
        // reorder_level: '',
        // stock_quantity: 0,
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('maintenance.spare-parts.store'));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">สร้างอะไหล่ใหม่</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="สร้างอะไหล่ใหม่" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <SparePartForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    items={items} // (5. 👈 [ส่ง] prop ลงไป)
                                    // (ลบ isEditMode)
                                />
                            </div>
                            <div className="flex items-center justify-end gap-4 px-6 py-4 bg-gray-50 border-t">
                                <Link
                                    href={route('maintenance.spare-parts.index')}
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
