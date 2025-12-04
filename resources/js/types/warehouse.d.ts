export interface StorageLocation {
    uuid: string;
    code: string;
    barcode: string;
    type: 'PICKING' | 'BULK' | 'RETURN' | 'DAMAGED' | 'INBOUND' | 'OUTBOUND';
    description?: string;
    is_active: boolean;
}

export interface Warehouse {
    uuid: string;
    name: string;
    code: string;
}
