import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Pagination from '@/Components/Pagination';
import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

// --- (Imports ใหม่สำหรับ UI ที่อัปเกรด) ---
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input'; // <-- 1. Import Input
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card'; // <-- 2. Import Card
import SearchFilter from '@/Components/SearchFilter';
import UserFilter from '@/Components/UserFilter';

// สร้าง Type สำหรับ Log
interface Log {
    id: number;
    description: string;
    causer: { id: number; name: string } | null; // "ใคร"
    subject: { id: number; name: string; email?: string } | null; // "อะไร"
    subject_type: string;
    properties: { ip?: string; user_agent?: string; email?: string };
    created_at: string;
}

// 1. (สำคัญ) เราต้องบอก TypeScript ว่า 'filters' prop มันซ้อนกัน
interface LogIndexPageProps extends PageProps {
    logs: {
        data: Log[];
        links: any[];
    };
    users: User[];
    filters: {
        // (มันอาจจะไม่มี 'filter' ในการโหลดครั้งแรก)
        filter?: {
            description?: string;
            causer_id?: string;
        }
        // (มันอาจจะมี 'page' ด้วย)
        page?: string;
    };
}

// (Helper) ฟังก์ชันแสดงผล Causer (ใคร)
function renderCauser(log: Log) {
    if (log.causer) return log.causer.name;
    if (log.properties?.email) return `Attempt: ${log.properties.email}`;
    return <span className="text-gray-400">System/Unknown</span>;
}

// (Helper) ฟังก์ชันแสดงผล Subject (อะไร)
function renderSubject(log: Log) {
    if (!log.subject) return 'N/A';
    // (เช่น "Role: Manager" หรือ "User: test@example.com")
    return `${log.subject_type.split('\\').pop()}: ${log.subject.name ?? log.subject.email}`;
}

export default function AuditLogIndex({ auth, logs, users, filters }: LogIndexPageProps) {

    // --- 2. (สำคัญ) แก้ไข 'useForm' ให้อ่านค่าที่ซ้อนกัน ---
    const { data, setData } = useForm({
        // (ใช้ Optional Chaining '?' เพื่อความปลอดภัย)
        description: filters.filter?.description || '',
        causer_id: filters.filter?.causer_id || 'all',
    });
    // --- สิ้นสุดการแก้ไข useForm ---

    // --- (สำคัญ) 2. สร้าง Ref เพื่อเช็กการโหลดครั้งแรก ---
    const isInitialMount = useRef(true);

    // 2. (แก้ไข) สร้างฟังก์ชัน reload
    // (เราใช้ 'router.get' แทน 'get' จาก useForm)
    const reload = useCallback(
        debounce((query) => {
            router.get(
                route('iam.audit-log.index'),
                {
                    // 1. (แก้ไข) ห่อ 'query' (data) ด้วย 'filter'
                    filter: query,
                    page: 1
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 500), []
    );

    // --- (สำคัญ) 3. แก้ไข useEffect ทั้งหมด ---
    useEffect(() => {
        // 3.1 ตรวจสอบว่านี่คือการโหลดครั้งแรก (หรือ re-render จาก pagination) หรือไม่
        if (isInitialMount.current) {
            // ถ้าใช่ -> ให้ข้ามไป, และตั้งค่าว่า "ครั้งต่อไปไม่ใช่ครั้งแรกแล้ว"
            isInitialMount.current = false;
        } else {
            // 3.2 ถ้าไม่ใช่ (เช่น User พิมพ์ในช่อง Search) -> ให้ reload
            reload(data);
        }
    }, [
        // 3.3 (เฝ้าดูค่าที่ User พิมพ์)
        data.description,
        data.causer_id,
        // (reload เป็น stable dependency)
        reload
    ]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Audit Log
                </h2>
            }
        >
            <Head title="Audit Log" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* --- 3. (แก้ไข) เปลี่ยนมาใช้ Card --- */}
                    <Card>
                        {/* --- 4. (ใหม่) Filter Bar --- */}
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">

                                {/* Filter 1: ค้นหา Action */}
                                <SearchFilter
                                    placeholder="Search by Action (e.g., 'login', 'created')"
                                    value={data.description}
                                    onChange={(value) => setData('description', value)}
                                />

                                {/* Filter 2: กรอง User (Causer) */}
                                <UserFilter
                                    value={data.causer_id}
                                    onValueChange={(value) => setData('causer_id', value)}
                                    users={users}
                                />
                            </div>
                        </CardHeader>

                        {/* --- 5. (ย้าย) Table เข้ามาใน CardContent --- */}
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User (Causer)</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Target (Subject)</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{renderCauser(log)}</TableCell>
                                            <TableCell>{log.description}</TableCell>
                                            <TableCell>{renderSubject(log)}</TableCell>
                                            <TableCell>
                                                {log.properties?.ip ?? <span className="text-gray-400">N/A</span>}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(log.created_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>

                        {/* --- 6. (ย้าย) Pagination เข้ามาใน CardFooter --- */}
                        <CardFooter>
                            <Pagination links={logs.links} />
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout >
    );
}
