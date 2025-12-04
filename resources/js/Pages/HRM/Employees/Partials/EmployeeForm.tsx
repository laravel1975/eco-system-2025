import React, { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import { User, PageProps } from '@/types';

interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department { id: number; name: string; company_id: number; }
interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string | null;
    hourly_rate?: number | string | null;
    employee_id_no: string | null; // <-- (1. เพิ่ม Field นี้)
    user: { id: number; name: string; email: string } | null;
    department: Department | null;
    company?: Company | null;
    join_date?: string;
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

export function EmployeeForm({ employee, commonData, linkedUserId, auth, onSuccessCallback }: EmployeeFormProps) {
    const isSuperAdmin = auth.user.roles.some((role: Role) => role.name === 'Super Admin');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        job_title: employee?.job_title || '',
        hourly_rate: employee?.hourly_rate || '',
        employee_id_no: employee?.employee_id_no || '', // <-- (เพิ่ม)
        department_id: String(employee?.department?.id || ''),
        user_id: String(linkedUserId || employee?.user?.id || ''),
        company_id: String(employee?.company?.id || (linkedUserId ? auth.user.company_id : (isSuperAdmin ? '' : (auth.user.company_id || '')))),
        join_date: employee?.join_date || new Date().toISOString().split('T')[0],
    });

    // (Logic กรอง User - เหมือนเดิม)
    const userOptions: User[] = useMemo(() => {
        const options = [...commonData.unlinkedUsers];
        if (employee && employee.user) {
            if (!options.find(u => u.id === employee.user!.id)) {
                options.push(employee.user as User);
            }
        }
        return options;
    }, [commonData.unlinkedUsers, employee]);

    // (Logic กรอง Department - เหมือนเดิม)
    const filteredDepartments = useMemo(() => {
        if (!data.company_id) return [];
        return commonData.departments.filter(
            (dept) => dept.company_id === parseInt(data.company_id, 10)
        );
    }, [data.company_id, commonData.departments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // (Callback ที่เราส่งเข้ามา)
        const handleSuccess = () => {
            reset();
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        };

        if (employee) {
            // (Update)
            patch(route('hrm.employees.update', employee.id), {
                onSuccess: handleSuccess,
                preserveScroll: true,
            });
        } else {
            // (Create)
            post(route('hrm.employees.store'), {
                onSuccess: handleSuccess,
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* (JSX ของฟอร์มทั้งหมด - เหมือนเดิม) */}
            {/* (First/Last Name) */}
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
            {/* (Job Title) */}
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

                {/* (ย้าย Employee ID No. มาคู่กัน หรือจัดตามความเหมาะสม) */}
                <div className="space-y-2">
                    <Label htmlFor="employee_id_no">Employee ID No.</Label>
                    <Input id="employee_id_no" value={data.employee_id_no || ''} onChange={(e) => setData('employee_id_no', e.target.value)} />
                    <InputError message={errors.employee_id_no} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input id="job_title" value={data.job_title || ''} onChange={(e) => setData('job_title', e.target.value)} />
                    <InputError message={errors.job_title} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="employee_id_no">Employee ID No. (for CSV Import)</Label>
                    <Input id="employee_id_no" value={data.employee_id_no || ''} onChange={(e) => setData('employee_id_no', e.target.value)} />
                    <InputError message={errors.employee_id_no} />
                </div>
            </div>

            {/* (Join Date) */}
            <div className="space-y-2">
                <Label htmlFor="join_date">Join Date</Label>
                <Input id="join_date" type="date" value={data.join_date} onChange={(e) => setData('join_date', e.target.value)} />
                <InputError message={errors.join_date} />
            </div>
            {/* (Company Dropdown) */}
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
                            <SelectItem
                                key={auth.user.company.id}
                                value={String(auth.user.company.id)}
                            >
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
            {/* (Department Dropdown) */}
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
            {/* (User Dropdown) */}
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

            {/* (ปุ่ม Submit - ไม่ต้องมี Cancel) */}
            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : (employee ? 'Save Changes' : 'Create Employee')}
                </Button>
            </div>
        </form>
    );
}
