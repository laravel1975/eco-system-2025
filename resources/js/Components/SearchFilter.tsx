import { Input } from '@/Components/ui/input';

// 1. กำหนด Props ที่ Component นี้ต้องการ
type SearchFilterProps = {
    value: string;
    // (เราใช้ (value: string) => void แทน (e) => ... เพื่อความยืดหยุ่น)
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

/**
 * Reusable Input component for text-based filtering.
 */
export default function SearchFilter({
    value,
    onChange,
    placeholder,
    className
}: SearchFilterProps) {
    return (
        <Input
            placeholder={placeholder}
            value={value}
            // 2. แปลง (e) => ... ให้อยู่ใน Component นี้
            onChange={(e) => onChange(e.target.value)}
            className={className}
        />
    );
}
