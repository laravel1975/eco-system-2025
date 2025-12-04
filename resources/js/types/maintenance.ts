export interface Technician { id: number; first_name: string; last_name: string; }
export interface Contractor { id: number; name: string; }

export interface Assignment {
    id: number;
    assignable: (Technician | Contractor) | null; // (สามารถเป็น null ได้ ถ้าข้อมูลถูกลบ)
    actual_labor_hours: number | null; // (ย้ายมาไว้ที่นี่)
}

export interface PartUsage { id: number; quantity_used: number; spare_part: SparePart; }
export interface ActivityType { id: number; name: string; code: string; }
export interface Attachment { id: number; file_name: string; file_path: string; }

export interface WorkOrder {
    id: number;
    work_order_code: string;
    status: string;
    priority: string;
    work_nature: string;
    description: string;

    // (Relations)
    asset: Asset | null;
    maintenance_type: MaintenanceType | null;
    assignments: any[]; // (เราสามารถกำหนด Type 'Assignment' ที่นี่ได้)

    // (Analysis Fields)
    failure_code_id: number | null;
    activity_type_id: number | null;
    downtime_hours: number | null;
}

// ( [สำคัญ] เพิ่มการ Export ค่าคงที่ (Constants))
// (TypeScript จะไม่ Export const ธรรมดา เราต้อง Export object)
export const WorkOrderPriority = {
    EMERGENCY: 'P1',
    URGENT: 'P2',
    NORMAL: 'P3',
    LOW: 'P4',
} as const; // (as const เพื่อให้เป็น Readonly)

export const WorkNature = {
    INTERNAL: 'Internal',
    EXTERNAL: 'External',
    MIXED: 'Mixed',
} as const;

export interface MaintenanceType {
    id: number;
    name: string;
    code: string;
    description: string | null;
}

export interface MaintenancePlan {
    id: number;
    title: string;
    status: string;
    next_due_date: string; // (YYYY-MM-DD)
    interval_days: number;
    asset: { name: string };
    maintenance_type: { name: string };
}

export interface Requester { id: number; first_name: string; last_name: string; }
export interface Asset { id: number; name: string; asset_code?: string; }
export interface MaintenanceRequest {
    id: number;
    problem_description: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    requester: Requester;
    asset: Asset;
}

export interface SparePart {
    id: number;
    name: string;
    part_number: string;
    stock_quantity: number;
    reorder_level: number;
    location: string | null;
}

export interface PaginatedLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Type สำหรับ Response มาตรฐานของ Laravel Paginator
 * (เราใช้ Generic <T> เพื่อให้ระบุ Type ของ data ได้)
 */
export interface PaginatedResponse<T> {
    data: T[];
    links: PaginatedLink[];

    // (ข้อมูล 'meta' ที่มาพร้อม Paginator)
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: PaginatedLink[]; // (meta.links จะซ้ำกับ links หลัก)
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
