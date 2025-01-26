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