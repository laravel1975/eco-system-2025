import React, { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button'; // แก้เป็น Components (ตัวใหญ่) ให้ตรง path
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import { User } from '@/types';

interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department { id: number; name: string; company_id: number; }

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string | null;
    hourly_rate?: number | string | null;
    employee_id_no: string | null;
    user: { id: number; name: string; email: string } | null;
    department: Department | null;
    company?: Company | null;
    join_date?: string;
    signature_url?: string | null; // ✅ เพิ่ม field นี้
}

interface AuthUser extends User {
    company: Company | null;
}

interface EmployeeFormProps {
    employee?: Employee;
    commonData: {
        departments: Department[];
        unlinkedUsers: User[];
        companies: Company[];
    };
    auth: { user: AuthUser };
    linkedUserId?: number;
    onSuccessCallback?: () => void;
}

export default function EmployeeForm({ employee, commonData, linkedUserId, auth, onSuccessCallback }: EmployeeFormProps) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    // ✅ State สำหรับแสดง Preview ลายเซ็น
    const [previewUrl, setPreviewUrl] = useState<string | null>(employee?.signature_url || null);

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: employee ? 'PATCH' : undefined, // ✅ ใช้ Method Spoofing สำหรับ Update เพื่อให้รองรับ File Upload
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        job_title: employee?.job_title || '',
        hourly_rate: employee?.hourly_rate || '',
        employee_id_no: employee?.employee_id_no || '',
        department_id: String(employee?.department?.id || ''),
        user_id: String(linkedUserId || employee?.user?.id || ''),
        company_id: String(employee?.company?.id || (linkedUserId ? auth.user.company_id : (isSuperAdmin ? '' : (auth.user.company_id || '')))),
        join_date: employee?.join_date || new Date().toISOString().split('T')[0],
        signature_path: null as File | null, // ✅ เพิ่ม Field ไฟล์
    });

    const userOptions: User[] = useMemo(() => {
        const options = [...commonData.unlinkedUsers];
        if (employee && employee.user) {
            if (!options.find(u => u.id === employee.user!.id)) {
                options.push(employee.user as User);
            }
        }
        return options;
    }, [commonData.unlinkedUsers, employee]);

    const filteredDepartments = useMemo(() => {
        if (!data.company_id) return [];
        return commonData.departments.filter(
            (dept) => dept.company_id === parseInt(data.company_id, 10)
        );
    }, [data.company_id, commonData.departments]);

    // ✅ ฟังก์ชันจัดการเมื่อเลือกไฟล์
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('signature_path', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const handleSuccess = () => {
            if (!employee) reset(); // Reset เฉพาะตอน Create
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        };

        if (employee) {
            // ✅ ใช้ post ไปยัง route update (เพราะมี _method: PATCH ใน data แล้ว)
            post(route('hrm.employees.update', employee.id), {
                onSuccess: handleSuccess,
                preserveScroll: true,
            });
        } else {
            post(route('hrm.employees.store'), {
                onSuccess: handleSuccess,
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* --- Basic Info --- */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                    <InputError message={errors.first_name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                    <InputError message={errors.last_name} />
                </div>
            </div>

            {/* --- Job & Identifiers --- */}
            <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input id="job_title" value={data.job_title} onChange={(e) => setData('job_title', e.target.value)} />
                <InputError message={errors.job_title} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (THB)</Label>
                    <Input
                        id="hourly_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.hourly_rate}
                        onChange={(e) => setData('hourly_rate', e.target.value)}
                    />
                    <InputError message={errors.hourly_rate} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="employee_id_no">Employee ID No.</Label>
                    <Input id="employee_id_no" value={data.employee_id_no || ''} onChange={(e) => setData('employee_id_no', e.target.value)} />
                    <InputError message={errors.employee_id_no} />
                </div>
            </div>

            {/* --- Date & Company --- */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="join_date">Join Date</Label>
                    <Input id="join_date" type="date" value={data.join_date} onChange={(e) => setData('join_date', e.target.value)} />
                    <InputError message={errors.join_date} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company_id">Company</Label>
                    <Select
                        onValueChange={(value) => {
                            setData('company_id', value);
                            setData('department_id', '');
                        }}
                        value={data.company_id}
                        disabled={!isSuperAdmin && !linkedUserId}
                    >
                        <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                        <SelectContent>
                            {!isSuperAdmin && auth.user.company ? (
                                <SelectItem value={String(auth.user.company.id)}>
                                    {auth.user.company.name}
                                </SelectItem>
                            ) : (
                                commonData.companies.map((company) => (
                                    <SelectItem key={company.id} value={String(company.id)}>{company.name}</SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.company_id} />
                </div>
            </div>

            {/* --- Department & User Link --- */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select
                        onValueChange={(value) => setData('department_id', value)}
                        value={data.department_id}
                        disabled={!data.company_id}
                    >
                        <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                        <SelectContent>
                            {filteredDepartments.map((dept) => (
                                <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.department_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user_id">Link to User Login (Optional)</Label>
                    <Select
                        onValueChange={(value) => setData('user_id', value === 'no_user_link' ? '' : value)}
                        value={data.user_id}
                        disabled={!!linkedUserId}
                    >
                        <SelectTrigger><SelectValue placeholder="No user linked" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="no_user_link">No user linked</SelectItem>
                            {userOptions.map((user) => (
                                <SelectItem key={user.id} value={String(user.id)}>{user.name} ({user.email})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.user_id} />
                </div>
            </div>

            {/* --- ✅ Signature Upload Section --- */}
            <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="signature_path">ลายเซ็นอิเล็กทรอนิกส์ (Digital Signature)</Label>
                <div className="flex items-center gap-6 p-4 border rounded-lg bg-gray-50">
                    <div className="w-40 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white overflow-hidden relative shadow-sm">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Signature Preview"
                                className="w-full h-full object-contain p-2"
                            />
                        ) : (
                            <span className="text-xs text-gray-400">No Signature</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <Input
                            id="signature_path"
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                            className="cursor-pointer bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            * รองรับไฟล์ PNG, JPG (พื้นหลังโปร่งใสจะดีที่สุด) <br/>
                            * ขนาดไฟล์ไม่เกิน 2MB
                        </p>
                        <InputError message={errors.signature_path} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Saving...' : (employee ? 'Save Changes' : 'Create Employee')}
                </Button>
            </div>
        </form>
    );
}
