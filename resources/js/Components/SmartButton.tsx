import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface SmartButtonProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    href: string;
    className?: string;
}

export default function SmartButton({ label, value, icon: Icon, href, className }: SmartButtonProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 transition-colors min-w-[140px] h-[50px]",
                className
            )}
        >
            <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-bold text-lg text-indigo-600">{value}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
        </Link>
    );
}
