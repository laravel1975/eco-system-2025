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

// Import Components
import EmployeeForm from './Partials/EmployeeForm';
import EmergencyContactManager from './Partials/EmergencyContactManager';
import EmployeeDocumentManager from './Partials/EmployeeDocumentManager';
import HrmNavigationMenu from '../Partials/HrmNavigationMenu';

// Interfaces
interface Company { id: number; name: string; }
interface Role { id: number; name: string; }
interface Department { id: number; name: string; company_id: number; }
interface EmergencyContact { id: number; name: string; relationship: string; phone_number: string; }
interface EmployeeDocument {
    id: number;
    title: string;
    document_type: string;
    file_name: string;
    file_size: number;
    expires_at: string | null;
    created_at: string;
}

// ✅ อัปเดต Interface ให้ครบถ้วนตามที่ EmployeeForm ต้องการ
export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string | null;
    employee_id_no: string | null; // ✅ เพิ่มบรรทัดนี้ (แก้ Error)
    email: string | null;
    phone: string | null;
    address: string | null;
    hourly_rate: number | null;
    user_id: number | null;
    user: { id: number; name: string; email: string } | null;
    department: Department | null;
    company?: Company | null;
    join_date?: string;
    signature_url?: string | null;
    emergency_contacts: EmergencyContact[];
    documents: EmployeeDocument[];
    department_id: number | null;
    company_id: number;
}

interface AuthUser extends User {
    company: Company;
}

interface EditPageProps extends PageProps {
    auth: { user: AuthUser; };
    employee: Employee;
    commonData: {
        departments: Department[];
        unlinkedUsers: User[];
        companies: Company[];
    };
}

export default function EmployeeEdit({ auth, employee, commonData }: EditPageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Employee: {employee.first_name} {employee.last_name}
                </h2>
            }
            navigationMenu={<HrmNavigationMenu />}
        >
            <Head title={`Edit ${employee.first_name} ${employee.last_name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">Profile & Signature</TabsTrigger>
                            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Profile */}
                        <TabsContent value="profile">
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900">Employee Profile</h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Update profile information, department, and e-signature.
                                    </p>

                                    <EmployeeForm
                                        employee={employee}
                                        commonData={commonData}
                                        auth={auth}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 2: Emergency Contacts */}
                        <TabsContent value="emergency">
                            <EmergencyContactManager employee={employee} />
                        </TabsContent>

                        {/* Tab 3: Documents */}
                        <TabsContent value="documents">
                            <EmployeeDocumentManager employee={employee} />
                        </TabsContent>

                    </Tabs>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
