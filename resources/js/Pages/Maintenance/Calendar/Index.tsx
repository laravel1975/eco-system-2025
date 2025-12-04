import React from 'react';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MaintenanceNavigationMenu from '@/Pages/Maintenance/Partials/MaintenanceNavigationMenu';

// (1. Import FullCalendar)
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth'; // (1. [ใหม่] Import Year View)
import rrulePlugin from '@fullcalendar/rrule';

// (2. Import Shadcn Card)
import { Card, CardContent } from "@/Components/ui/card";

/*
|--------------------------------------------------------------------------
| React Component
|--------------------------------------------------------------------------
*/
export default function MaintenanceCalendarIndex({ auth }: PageProps) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">ปฏิทินซ่อมบำรุง</h2>}
            navigationMenu={<MaintenanceNavigationMenu />}
        >
            <Head title="ปฏิทินซ่อมบำรุง" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <Card>
                        <CardContent className="p-4">
                            <FullCalendar
                                // (2. [อัปเกรด] เพิ่ม multiMonthPlugin)
                                plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin, rrulePlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    // (3. [อัปเกรด] เพิ่มปุ่ม Week/Year)
                                    right: 'dayGridMonth,dayGridWeek,multiMonthYear'
                                }}

                                // (Endpoint API - เหมือนเดิม)
                                events={route('maintenance.calendar.events.api')}

                                // (Event Click - เหมือนเดิม)
                                eventClick={(info) => {
                                    if (info.event.url) {
                                        info.jsEvent.preventDefault();
                                        window.open(info.event.url, "_blank");
                                    }
                                }}

                                // (4. [อัปเกรด] เพิ่มป้ายปุ่มภาษาไทย)
                                locale="th"
                                buttonText={{
                                  today: 'วันนี้',
                                  month: 'เดือน',
                                  week: 'สัปดาห์', // (เพิ่ม)
                                  year: 'ปี'       // (เพิ่ม)
                                }}

                                height="auto"
                            />
                        </CardContent>
                    </Card>
                    <div className="mt-4 text-sm text-gray-600">
                        * หมายเหตุ: <span className="p-1 text-xs rounded bg-blue-100 text-blue-800">สีฟ้า</span> = แผน PM ที่ถึงกำหนด, <span className="p-1 text-xs rounded bg-red-100 text-red-800">สีแดง/ส้ม</span> = ใบสั่งซ่อม (Work Order) ที่ยังไม่ปิดงาน
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
