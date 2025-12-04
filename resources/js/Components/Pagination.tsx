import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 1. สร้าง Interface สำหรับ Link ที่ Laravel ส่งมา
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// 2. สร้าง Type สำหรับ Props (รับ links และ className)
type PaginationProps = {
    links: PaginationLink[];
    className?: string;
};

export default function Pagination({ links, className }: PaginationProps) {

    // (ฟังก์ชัน Helper เพื่อถอดรหัส HTML entities เช่น &laquo;)
    function decodeHtml(html: string) {
        if (typeof window === 'undefined') {
            return html; // (ทำงานเฉพาะฝั่ง Client)
        }
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    // (ไม่ต้องแสดงผลถ้ามีแค่ 2 หน้า หรือน้อยกว่า)
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div className="flex flex-wrap -mb-1">
                {links.map((link, index) => {
                    // 1. ถ้า Link เป็น null (เช่น ... dots)
                    if (link.url === null) {
                        return (
                            <Button
                                key={index}
                                variant="ghost"
                                disabled
                                className="mr-1 mb-1"
                            >
                                {decodeHtml(link.label)}
                            </Button>
                        );
                    }

                    // 2. ถ้า Link เป็นหน้าปัจจุบัน (Active)
                    if (link.active) {
                        return (
                            <Button
                                key={index}
                                variant="outline" // <-- ใช้ 'outline' สำหรับหน้าปัจจุบัน
                                disabled
                                className="mr-1 mb-1"
                            >
                                {decodeHtml(link.label)}
                            </Button>
                        );
                    }

                    // 3. ถ้า Link เป็นหน้าอื่น (ปกติ)
                    return (
                        <Button
                            key={index}
                            asChild // <-- (สำคัญ) บอก Button ให้ใช้ Link
                            variant="ghost"
                            className="mr-1 mb-1"
                        >
                            <Link href={link.url}>
                                {decodeHtml(link.label)}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
