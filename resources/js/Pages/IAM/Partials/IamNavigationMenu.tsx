import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// (1. Import ทุกอย่างที่เมนูนี้ต้องการ)
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/Components/ui/navigation-menu';

/*
|--------------------------------------------------------------------------
| (2. นี่คือ Component เมนูของ Maintenance BC)
|--------------------------------------------------------------------------
| (3. เพิ่ม export default)
*/
export default function IamNavigationMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {/* (เมนู 1: Dashboard ของ Hrm) */}
                <NavigationMenuItem>
                    <Link
                        href={route('iam.dashboard')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('iam.dashboard') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Dashboard
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link
                        href={route('iam.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('iam.index') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Users Management
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link
                        href={route('iam.roles.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('iam.roles*') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Roles
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link
                        href={route('companies.index')}
                        className={cn(
                            navigationMenuTriggerStyle(),
                            route().current('companies.index') ? 'bg-accent text-accent-foreground' : ''
                        )}
                    >
                        Companies
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};
