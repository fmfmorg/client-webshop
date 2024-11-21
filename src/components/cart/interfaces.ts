import type { IProduct } from "@components/catalogue-item/interfaces";

export interface ICartItem {
    id:string;
    quantity:number;
    dateAdded:number;
    finalPrice:number;
}

export interface ICartItemMap {
    [k:string]:ICartItem;
}

export interface ICampaignDiscount {
    id:number;
    name:string;
    amount:number;
}

export interface IVoucherDiscount {
    id:number;
    code:string;
    type:number;
    amount:number;
}

export interface ICartContent {
    items?:ICartItem[];
    staffDiscount:number;
    campaignDiscounts:ICampaignDiscount[];
    voucherDiscounts:IVoucherDiscount[];
    memberDiscount:number;
    memberDiscountRate:number;
    total:number;
    subtotalBeforeDelivery:number;
}

export interface IAddToBagResponse {
    cartContent:ICartContent;
    cartItemMap:ICartItemMap;
    total:number;
    productDetails:IProduct[];
}