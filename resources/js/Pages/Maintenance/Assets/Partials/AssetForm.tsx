import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { AssetFormData } from '@/types'; // (Type นี้ต้องอัปเดต warehouse_uuid)

/*
|--------------------------------------------------------------------------
| 1. Type Definitions (TypeScript)
|--------------------------------------------------------------------------
*/

// (1. 👈 [ใหม่] Type สำหรับ List Warehouse)
interface WarehouseOption {
    uuid: string;
    name: string;
    code: string;
}

// (2. 👈 [แก้ไข] Props ที่รับ)
interface AssetFormProps {
    data: AssetFormData; // (Type นี้ใน @/types/index.d.ts ต้องแก้เป็น warehouse_uuid)
    setData: (field: keyof AssetFormData, value: any) => void;
    errors: Partial<Record<keyof AssetFormData, string>>;
    warehouses: WarehouseOption[]; // (3. 👈 [ใหม่] รับ List Warehouse)
}

// (Helper Functions - formatDateForDisplay) ...
const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return ''; // (คืนค่าว่างสำหรับ Input Date)
    try {
        return dateString.split('T')[0];
    } catch (e) {
        return dateString;
    }
};

/*
|--------------------------------------------------------------------------
| 2. React Component
|--------------------------------------------------------------------------
*/
export default function AssetForm({ data, setData, errors, warehouses }: AssetFormProps) {

    const statusOptions = [
        { value: 'active', label: 'Active (ใช้งาน)' },
        { value: 'inactive', label: 'Inactive (ไม่ใช้งาน)' },
        { value: 'in_repair', label: 'In Repair (กำลังซ่อม)' },
        { value: 'decommissioned', label: 'Decommissioned (ปลดระวาง)' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* คอลัมน์ซ้าย */}
            <div>
                {/* 1. Asset Name */}
                <div>
                    <InputLabel htmlFor="name" value="ชื่อทรัพย์สิน *" />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* 2. Asset Code */}
                <div className="mt-4">
                    <InputLabel htmlFor="asset_code" value="รหัสทรัพย์สิน *" />
                    <TextInput
                        id="asset_code"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.asset_code}
                        onChange={(e) => setData('asset_code', e.target.value)}
                        required
                    />
                    <InputError message={errors.asset_code} className="mt-2" />
                </div>

                {/* 3. (4. 👈 [แก้ไข] เปลี่ยนเป็น Dropdown) */}
                <div className="mt-4">
                    <InputLabel htmlFor="warehouse_uuid" value="คลังสินค้า (ที่ตั้ง)" />
                    <select
                        id="warehouse_uuid"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.warehouse_uuid || ''} // (ใช้ warehouse_uuid)
                        onChange={(e) => setData('warehouse_uuid', e.target.value)}
                    >
                        <option value="">-- ไม่ระบุ --</option>
                        {warehouses.map(wh => (
                            <option key={wh.uuid} value={wh.uuid}>
                                {`[${wh.code}] ${wh.name}`}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.warehouse_uuid} className="mt-2" />
                    {/* (เราลบ InputError ของ 'location' เก่าทิ้ง) */}
                </div>

                {/* 4. Status */}
                <div className="mt-4">
                    <InputLabel htmlFor="status" value="สถานะ *" />
                    <select
                        id="status"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        required
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.status} className="mt-2" />
                </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div>
                {/* 5. Serial Number */}
                <div>
                    <InputLabel htmlFor="serial_number" value="Serial Number" />
                    <TextInput
                        id="serial_number"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.serial_number || ''}
                        onChange={(e) => setData('serial_number', e.target.value)}
                    />
                    <InputError message={errors.serial_number} className="mt-2" />
                </div>

                {/* 6. Model Number */}
                <div className="mt-4">
                    <InputLabel htmlFor="model_number" value="Model Number" />
                    <TextInput
                        id="model_number"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.model_number || ''}
                        onChange={(e) => setData('model_number', e.target.value)}
                    />
                    <InputError message={errors.model_number} className="mt-2" />
                </div>

                {/* 7. Purchase Date */}
                <div className="mt-4">
                    <InputLabel htmlFor="purchase_date" value="วันที่ซื้อ" />
                    <TextInput
                        id="purchase_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={formatDateForDisplay(data.purchase_date)} // (ใช้ Helper)
                        onChange={(e) => setData('purchase_date', e.target.value)}
                    />
                    <InputError message={errors.purchase_date} className="mt-2" />
                </div>

                {/* 8. Warranty End Date */}
                <div className="mt-4">
                    <InputLabel htmlFor="warranty_end_date" value="วันที่หมดประกัน" />
                    <TextInput
                        id="warranty_end_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={formatDateForDisplay(data.warranty_end_date)} // (ใช้ Helper)
                        onChange={(e) => setData('warranty_end_date', e.target.value)}
                    />
                    <InputError message={errors.warranty_end_date} className="mt-2" />
                </div>
            </div>

            {/* ส่วนล่าง (เต็มความกว้าง) */}
            <div className="md:col-span-2 mt-4">
                {/* 9. Description */}
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
