import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface FilterDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[]; // หรือ {id, name} ถ้ามาจาก DB
    placeholder?: string;
    className?: string;
}

export default function FilterDropdown({
    value,
    onChange,
    options,
    placeholder = "Select Category",
    className
}: FilterDropdownProps) {
    return (
        <div className={className}>
            <Select
                value={value === '' ? 'all' : value}
                onValueChange={(val) => onChange(val === 'all' ? '' : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {options.map((option, index) => (
                        <SelectItem key={index} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
