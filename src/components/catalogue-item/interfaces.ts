import type { IProductMeasurement } from "@misc/interfaces";

export interface IProductImages {
    name:string;
    ext:string;
    catalogue?:boolean;
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
    metaDescription:string;
    price:number;
    discountedPrice:number;
    url:string;
    images:IProductImages[];
    snippetImages:string[];
    stockQuantities:IStockQuantity[];
    relatedProducts:IProduct[];
    totalSales:number;
    createdAt:number;
    measurements:IProductMeasurement[];
    soldAsPair:boolean;
    metalColor:string;
    mainType:string;
    subType:string;
}

export interface IProductIdOrderItem {
    id:string
    order:number;
    group:number;
    observe:boolean;
}

export interface IProductIdOrderMap {
    [id:string]:IProductIdOrderItem;
}