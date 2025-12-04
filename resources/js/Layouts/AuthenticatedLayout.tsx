import React, { useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { LogIn, LogOut, User as UserIcon, Wrench } from 'lucide-react';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
// --- 3. เพิ่ม Imports สำหรับ Toast ---
import { Toaster } from '@/Components/ui/sonner'; // Container ที่ toast จะปรากฏ
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// สร้าง Type สำหรับ Flash Props
type PageProps = {
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    auth: {
        user: User;
        attendanceStatus: 'absent' | 'clocked_in' | 'clocked_out' | null;
    };
    [key: string]: any;
};
interface Role { id: number; name: string; }

// (1. [ใหม่] อัปเกรด Props ที่ Layout นี้รับ)
type AuthenticatedProps = {
    user: User;
    header?: React.ReactNode;
    navigationMenu?: React.ReactNode; // (2. [ใหม่] นี่คือช่องสำหรับ "เสียบ" เมนู)
};

// --- Authenticated Layout ---
export default function Authenticated({
    user,
    header,
    navigationMenu, // (3. [ใหม่] รับเมนูจาก Props)
    children,
}: PropsWithChildren<AuthenticatedProps>) {

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { props } = usePage<PageProps>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]); // ทำงานทุกครั้งที่ 'flash' (จาก props) เปลี่ยนแปลง

    // (5. เพิ่ม State สำหรับ Loading GPS)
    const [isClocking, setIsClocking] = useState(false);

    // (6. ฟังก์ชันจัดการ Clock In/Out)
    const handleClockAction = (action: 'in' | 'out') => {
        setIsClocking(true);

        // 6.1 ขอพิกัด GPS
        navigator.geolocation.getCurrentPosition(
            // (Success)
            (position) => {
                const { latitude, longitude } = position.coords;
                const routeName = action === 'in' ? 'hrm.attendance.clock-in' : 'hrm.attendance.clock-out';

                // 6.2 ยิง POST ไปที่ Controller
                router.post(route(routeName), {
                    latitude,
                    longitude,
                }, {
                    onFinish: () => setIsClocking(false),
                    preserveScroll: true,
                    // (onSuccess/onError จะถูกจัดการโดย Toast/Flash Message)
                });
            },
            // (Error - ผู้ใช้ปฏิเสธ/ไม่เจอพิกัด)
            (error) => {
                alert(`Error getting location: ${error.message}`);
                setIsClocking(false);
            }
        );
    };


    const isSuperAdmin = user.roles.some((role: Role) => role.name === 'Super Admin');

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                {/* (4. [ใหม่] ลิงก์นี้ควรกลับไปหน้า Hub) */}
                                <Link href={route('dashboard')}>
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            {/* (5. [สำคัญ] ส่วนเมนู Dynamic) */}
                            <div className="hidden sm:ms-10 sm:flex">
                                {navigationMenu} {/* (6. เสียบเมนูที่ได้รับจาก Props ตรงนี้) */}
                            </div>
                        </div>

                        {/* (Profile Dropdown - ไม่ได้แก้ไข) */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">

                            <Button variant="outline" size="sm" asChild className="me-4">
                                <Link href={route('maintenance.service-request.create')}>
                                    <Wrench className="mr-2 h-4 w-4" />
                                    แจ้งซ่อม
                                </Link>
                            </Button>

                            {/* --- (7. เพิ่มปุ่ม Clock In/Out) --- */}
                            {props.auth.attendanceStatus && (
                                <div className="me-4">
                                    {props.auth.attendanceStatus === 'absent' || props.auth.attendanceStatus === 'clocked_out' ? (
                                        <Button
                                            onClick={() => handleClockAction('in')}
                                            disabled={isClocking}
                                            className='bg-green-500 hover:bg-green-600'
                                        >
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {isClocking ? 'Loading GPS...' : 'Clock In'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleClockAction('out')}
                                            disabled={isClocking}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            {isClocking ? 'Loading GPS...' : 'Clock Out'}
                                        </Button>
                                    )}
                                </div>
                            )}
                            {/* --- (สิ้นสุดการเพิ่มปุ่ม) --- */}

                            {/* ... (โค้ด DropdownMenu สำหรับ Profile) ... */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* เราเปลี่ยนจากปุ่มข้อความเป็นปุ่มไอคอน */}
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            {/* แสดงชื่อและอีเมลในเมนู */}
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')}>Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        {/* ใช้ Link ของ Inertia เพื่อ Logout */}
                                        <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* (Mobile Menu - ไม่ได้แก้ไข) */}
                        <div className="-me-2 flex items-center sm:hidden">

                            {/* --- (7. เพิ่มปุ่ม Clock In/Out) --- */}
                            {props.auth.attendanceStatus && (
                                <div className="me-4">
                                    {props.auth.attendanceStatus === 'absent' || props.auth.attendanceStatus === 'clocked_out' ? (
                                        <Button
                                            onClick={() => handleClockAction('in')}
                                            disabled={isClocking}
                                            className='bg-green-500 hover:bg-green-600'
                                        >
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {isClocking ? 'Loading GPS...' : 'Clock In'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleClockAction('out')}
                                            disabled={isClocking}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            {isClocking ? 'Loading GPS...' : 'Clock Out'}
                                        </Button>
                                    )}
                                </div>
                            )}
                            {/* --- (สิ้นสุดการเพิ่มปุ่ม) --- */}

                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                        </div>
                    </div>
                </div>

                {/* (Mobile Menu Responsive - ไม่ได้แก้ไข) */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        {/* เพิ่ม Link ใน Mobile Menu ด้วย */}
                        <ResponsiveNavLink
                            href={route('iam.index')}
                            active={route().current('iam.index')}>
                            Users
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        <ResponsiveNavLink href={route('profile.edit')}>
                            Profile
                        </ResponsiveNavLink>
                        <ResponsiveNavLink method="post" href={route('logout')} as="button">
                            Log Out
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav >

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )
            }

            <main>
                {children}
                <Toaster richColors position="top-right" />
            </main>
        </div >
    );
}
