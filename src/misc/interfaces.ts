import type { ICartContent, ICartItem, ICartItemMap } from "@components/cart/interfaces";
import type { IProduct } from "@components/catalogue-item/interfaces";
import type { CountryCode } from "@revolut/checkout/types/types";

export interface IAddressStockLevelMap {
    [a:string]:{[b:string]:number}
}

export interface IMdwResponse {
    cartContent:ICartContent;
    cartItemMap:{[k:string]:ICartItem};
    cartProductDetailsMap:{[k:string]:IProduct};
    expiresAt:number;
    sessionID:string;
    signedIn:boolean;
    paymentInProcess:boolean;
    selCollectionPoint:number;
    prfCollectionPoint:number;
    shopAddressMap:IShopAddressMap;
    minSpendForFreeShipping:number;
    firstName:string;
    headerCarouselTexts:string[];
}

export interface ICountry {
    id:string;
    name:string;
    deliveryAvailable:boolean;
}

export interface INoServiceCountryMap {
    [k:string]:string;
}

export interface IDeliveryMethod {
    id:number;
    name:string;
    cost:number;
    minSpendForFree:number;
}

export interface IDeliveryMethodMap {
    [k:string]:IDeliveryMethod;
}

export interface IUserAddress {
    id:string;
    firstName:string;
    lastName:string;
    phoneNumber:string;
    line1:string;
    line2:string;
    city:string;
    stateProvince:string;
    postcode:string;
    countryID:CountryCode;
    countryName:string;
    isDefault:boolean;
    isShipping?:boolean;
    isCheckoutPage?:boolean;
}

export interface IShoppingBagSidebarProp {
    isSignedIn:boolean;
    cartContent:ICartContent;
    freeShippingLimit:number;
    cartItemMap?:ICartItemMap;
    productDetailsMap?:ICatalogueMap;
}

export interface IUserAddressMap {
    [k:string]:IUserAddress;
}

export interface ICatalogueMap {
    [id:string]:IProduct;
}

export interface IMemberShippingAddressUpdateResponse {
    addressID:string;
    deliveryMethodMap:IDeliveryMethodMap;
    selectedDeliveryID:number;
    total:number;
    userCountry:string;
}

export interface IMemberDeliveryMethodUpdateResponse {
    total:number;
    deliveryCost:number;
    deliveryMethodID:number;
}

export interface IMemberEditAddressUpdateResponse {
    address:IUserAddress;
    deliveryMethodMap?:IDeliveryMethodMap;
    selectedDeliveryID?:number;
    total?:number;
}

export interface IMemberDeleteAddressUpdateResponse {
    deleteAddressID:string;
    newShippingAddressID?:string;
    deliveryMethodMap?:IDeliveryMethodMap;
    selectedDeliveryID?:number;
    total?:number;
}

export interface IMemberAddressUpdateAfterDisconnectedResponse {
    addressMap:IUserAddressMap;
    selectedAddressID:string;
    deliveryMethodMap:IDeliveryMethodMap;
    selectedDeliveryID:number;
}

export interface IOrderDetails {
    location:string;
    paymentMethod:string;
    email:string;
    orderDate:number;
    orderStatus:string;
    trackingNumber:string;
    deliveryMethod:string;
    deliveryCost:number;
}

export interface ITrackOrderResponse {
    shippingAddress:IUserAddress;
    cartContent:ICartContent;
    productDetails:IProduct[];
    orderDetails:IOrderDetails;
}

export interface IShopAddress {
    id:number;
    name:string;
    line1:string;
    line2:string;
    city:string;
    stateProvince:string;
    postcode:string;
    country:string;
}

export interface IShopAddressMap {
    [k:string]:IShopAddress;
}