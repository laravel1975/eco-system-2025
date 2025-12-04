import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";

// (1. Import ฟอร์มที่เราแยกไว้)
import { EmployeeForm } from './Partials/EmployeeForm';
import EmergencyContactManager from './Partials/EmergencyContactManager';
import EmployeeDocumentManager from './Partials/EmployeeDocumentManager';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// (2. สร้าง Interfaces สำหรับหน้านี้ - คล้ายกับ Index)
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department { id: number; name: string; company_id: number; }
interface EmergencyContact { id: number; name: string; relationship: string; phone_number: string; } // (Type ใหม่)
interface EmployeeDocument {
    id: number;
    title: string;
    document_type: string;
    file_name: string;
    file_size: number;
    expires_at: string | null;
    created_at: string;
}
interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string | null;
    user: { id: number; name: string; email: string } | null;
    department: Department | null;
    company?: Company | null;
    join_date?: string;
    emergency_contacts: EmergencyContact[];
    documents: EmployeeDocument[];
}
interface AuthUser extends User {
    company: Company;
}

interface EditPageProps extends PageProps {
    auth: { user: AuthUser; };
    employee: Employee; // (Prop ที่ส่งมาจาก Controller@edit)
    commonData: {
        departments: Department[];
        unlinkedUsers: User[];
        companies: Company[];
    };
}

// --- (Component หลัก: หน้า Edit) ---
export default function EmployeeEdit({ auth, employee, commonData }: EditPageProps) {
    return (

        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Employee: {employee.first_name} {employee.last_name}
                </h2>
            }
            // (5. [สำคัญ] "เสียบ" เมนูของ BC นี้เข้าไปใน Layout)
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title="Edit Employee" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* (4. สร้างโครงสร้างแท็บ) */}
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        {/* (แท็บที่ 1: Profile) */}
                        <TabsContent value="profile">
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-medium">Employee Profile</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Update the employee's profile information and department.
                                    </p>
                                    {/* (เรียกใช้ EmployeeForm) */}
                                    <EmployeeForm
                                        employee={employee}
                                        commonData={commonData}
                                        auth={auth}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* (แท็บที่ 2: Emergency Contacts) */}
                        <TabsContent value="emergency">
                            {/* (เรียกใช้ Placeholder) */}
                            <EmergencyContactManager employee={employee} />
                        </TabsContent>

                        {/* (4. เพิ่ม) แท็บที่ 3: Documents */}
                        <TabsContent value="documents">
                            <EmployeeDocumentManager employee={employee} />
                        </TabsContent>

                    </Tabs>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
