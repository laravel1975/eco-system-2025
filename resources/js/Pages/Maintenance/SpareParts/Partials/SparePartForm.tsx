import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

/*
|--------------------------------------------------------------------------
| 1. Type Definitions (TypeScript)
|--------------------------------------------------------------------------
*/

// (1. 👈 [ใหม่] Type สำหรับ List Item)
interface ItemOption {
    uuid: string;
    name: string;
    part_number: string;
}

// (2. 👈 [แก้ไข] Type ของฟอร์ม)
export interface SparePartFormData {
    name: string;
    part_number: string;
    description: string | null;
    item_uuid: string | null; // (เพิ่ม 'item_uuid')

    // (ลบ field เก่า)
    // location: string | null;
    // unit_cost: number | string | null;
    // reorder_level: number | string | null;
    // stock_quantity?: number | string | null;
}

// (3. 👈 [แก้ไข] Props ที่รับ)
interface SparePartFormProps {
    data: SparePartFormData;
    setData: (field: keyof SparePartFormData, value: any) => void;
    errors: Partial<Record<keyof SparePartFormData, string>>;
    items: ItemOption[]; // (เพิ่ม List Item)
    // (ลบ isEditMode เพราะเราไม่ใช้แล้ว)
    // isEditMode?: boolean;
}


/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function SparePartForm({ data, setData, errors, items }: SparePartFormProps) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* คอลัมน์ซ้าย */}
            <div>
                {/* 1. Name */}
                <div>
                    <InputLabel htmlFor="name" value="ชื่ออะไหล่ (ในระบบซ่อมบำรุง) *" />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required autoFocus
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* 2. Part Number */}
                <div className="mt-4">
                    <InputLabel htmlFor="part_number" value="รหัสอะไหล่ (Part Number) *" />
                    <TextInput
                        id="part_number"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.part_number}
                        onChange={(e) => setData('part_number', e.target.value)}
                        required
                    />
                    <InputError message={errors.part_number} className="mt-2" />
                </div>

                {/* (3. 👈 [แก้ไข] เปลี่ยนเป็น Dropdown เชื่อม Item) */}
                <div className="mt-4">
                    <InputLabel htmlFor="item_uuid" value="เชื่อมโยงกับ Inventory Item *" />
                    <select
                        id="item_uuid"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.item_uuid || ''}
                        onChange={(e) => setData('item_uuid', e.target.value)}
                        required
                    >
                        <option value="">-- เลือก Item จาก Inventory --</option>
                        {items.map(item => (
                            <option key={item.uuid} value={item.uuid}>
                                {`[${item.part_number}] ${item.name}`}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.item_uuid} className="mt-2" />
                    <p className="mt-1 text-xs text-gray-500">
                        * เพื่อให้ระบบสามารถตัดสต็อกและดึงต้นทุนได้
                    </p>
                </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div>
                {/* (4. 👈 [ลบ] ช่อง Stock, Cost, Reorder, Location ทั้งหมด) */}

                {/* (5. 👈 [เพิ่ม] แสดงข้อความอธิบายแทน) */}
                <div>
                    <InputLabel value="ข้อมูลสต็อกและต้นทุน" />
                    <div className="mt-1 text-sm text-gray-600 p-4 bg-gray-50 rounded-md border space-y-2">
                        <p>
                            <span className="font-semibold">สต็อกคงเหลือ (Stock):</span>
                            ถูกจัดการโดย <span className="font-semibold">Stock Bounded Context</span>
                            (ข้อมูลจะซิงค์มาที่หน้ารายการอะไหล่โดยอัตโนมัติ)
                        </p>
                        <p>
                            <span className="font-semibold">ต้นทุน (Cost) และจุดสั่งซื้อ (Reorder):</span>
                            ถูกจัดการโดย <span className="font-semibold">Inventory Bounded Context</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ส่วนล่าง (เต็มความกว้าง) */}
            <div className="md:col-span-2 mt-4">
                <InputLabel htmlFor="description" value="คำอธิบาย / หมายเหตุ" />
                <textarea
                    id="description"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows={4}
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

        </div>
    );
}
