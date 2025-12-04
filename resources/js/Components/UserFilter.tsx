import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/Components/ui/select';
import { User } from '@/types';

// (Type UserFilterProps ... ไม่ต้องแก้ไข)
type UserFilterProps = {
    value: string;
    onValueChange: (value: string) => void;
    users: User[];
    className?: string;
};

/**
 * Reusable Select component for filtering by User.
 */
export default function UserFilter({
    value,
    onValueChange,
    users,
    className // <-- (เรายังรับ prop นี้)
}: UserFilterProps) {
    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            // --- 1. (สำคัญ) ลบ className ออกจาก <Select> ---
        >
            {/* --- 2. (สำคัญ) ย้าย className มาที่ <SelectTrigger> --- */}
            <SelectTrigger className={className}>
                <SelectValue placeholder="Filter by User" />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                    <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
