export interface IProductImages {
    name:string;
    ext:string;
    catalogue:boolean;
}

export interface IStockQuantity {
    name:string;
    quantity:number;
    address:number;
}

export interface IProduct {
    id:string;
    name:string;
    description:string;
    specification?:string;
    price:number;
    discountedPrice:number;
    url:string;
    images:IProductImages[];
    stockQuantity:number;
    stockQuantities:IStockQuantity[];
    relatedProducts:IProduct[];
    totalSales:number;
    createdAt:number;
}