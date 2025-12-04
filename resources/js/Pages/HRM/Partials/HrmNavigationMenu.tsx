import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// (1. Import ทุกอย่างที่เมนูนี้ต้องการ)
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/Components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

/*
|--------------------------------------------------------------------------
| (2. นี่คือ Component เมนูของ Maintenance BC)
|--------------------------------------------------------------------------
| (3. เพิ่ม export default)
*/
export default function HrmNavigationMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {/* (เมนู 1: Dashboard ของ Hrm) */}
                <NavigationMenuItem>
                    <Link
                        href={route('hrm.dashboard')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('hrm.dashboard') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Dashboard
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 2: Employees) */}
                <NavigationMenuItem>
                    <Link
                        href={route('hrm.employees.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('hrm.employees.*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Employees
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 3: Attendance) */}
                <NavigationMenuItem>
                    <Link
                        href={route('hrm.attendances.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('hrm.attendances.*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Attendances
                    </Link>
                </NavigationMenuItem>

                {/* (เมนู 4: Requests (Dropdown)) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn("h-10 px-4 py-2 text-sm font-medium",
                                (route().current('hrm.leave-requests.*')) ||
                                    (route().current('hrm.overtime-requests.*')) ?
                                    'bg-accent text-accent-foreground' : '')}
                        >
                            Requests <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('hrm.leave-requests.index')}>Leave</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('hrm.overtime-requests.index')}>Overtime</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* (เมนู 5: Settings (Dropdown)) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn("h-10 px-4 py-2 text-sm font-medium",
                                (route().current('hrm.holidays.*')) ||
                                    (route().current('hrm.departments.*')) ||
                                    (route().current('hrm.org-chart.*')) ||
                                    (route().current('hrm.leave-types.*')) ?
                                    'bg-accent text-accent-foreground' : '')}
                        >
                            Configuration <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link href={route('hrm.holidays.index')}>Calendar Holiday</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('hrm.leave-types.index')}>Leave Type</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('hrm.departments.index')}>Departments</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('hrm.org-chart.index')}>Organizational Chart</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </NavigationMenuList>
        </NavigationMenu>
    );
};
