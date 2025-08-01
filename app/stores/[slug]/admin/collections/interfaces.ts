export interface Product {
    id: string;
    name: string;
    slug: string;
    price: string;
    inventory: number;
    isActive: boolean;
    categoryId: string | null;
    categoryName: string | null;
}

export interface Collection {
    id: string;
    name: string;
    storeId: string;
}

export const PRODUCTS_PER_PAGE = 10;
