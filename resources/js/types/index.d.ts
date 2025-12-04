export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    phone?: string,
    avatar_url?: string,
    company_id: number | null;
    is_active: boolean;
    two_factor_secret: string | null;
    two_factor_recovery_codes: string[] | null;
    two_factor_confirmed_at: string | null;
    roles: [];
}

interface Asset {
    id: number;
    name: string;
    asset_code: string;
    location: string | null;
    status: string;
}

export interface AssetFormData {
    name: string;
    asset_code: string;
    description: string | null;
    location: string | null;
    model_number: string | null;
    serial_number: string | null;
    purchase_date: string | null; // (ใช้ string YYYY-MM-DD สำหรับ <input type="date">)
    warranty_end_date: string | null;
    status: string;
    warehouse_uuid: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

/**
 * อธิบายโครงสร้างของ Link แต่ละตัวใน Paginator
 */
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * อธิบายโครงสร้าง Paginator ที่ Laravel ส่งมา
 * โดย 'T' คือ Type ของข้อมูล (เช่น ItemIndexData)
 */
export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
