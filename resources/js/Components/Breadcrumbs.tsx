import React from 'react';
import { Link } from '@inertiajs/react';

// (Type สำหรับ Link แต่ละอัน)
interface BreadcrumbLink {
    label: string;
    href: string;
}

// (Props ที่ Component นี้ต้องการ)
interface BreadcrumbProps {
    links: BreadcrumbLink[];
    activeLabel: string; // (หน้าสุดท้ายที่ Active อยู่)
}

export default function Breadcrumbs({ links, activeLabel }: BreadcrumbProps) {
    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {/* (วนลูปสร้าง Link ที่คลิกได้) */}
                {links.map((link) => (
                    <li key={link.href}>
                        <div className="flex items-center">
                            <Link
                                href={link.href}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                {link.label}
                            </Link>

                            {/* (นี่คือตัวคั่น ... / ... ที่คุณขอครับ) */}
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                    </li>
                ))}

                {/* (หน้าสุดท้าย (Active) จะเป็นสีเทาและคลิกไม่ได้) */}
                <li aria-current="page">
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500">
                            {activeLabel}
                        </span>
                    </div>
                </li>
            </ol>
        </nav>
    );
}
