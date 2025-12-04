export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
}

export interface Customer {
    id: string;
    name: string;
}

export interface OrderItemRow {
    product_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}
