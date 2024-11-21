import type { IAddToBagResponse } from "@components/cart/interfaces";
import type { IProduct } from "@components/catalogue-item/interfaces";
import { 
    type IMemberDeleteAddressUpdateResponse, 
    type IMemberDeliveryMethodUpdateResponse, 
    type IMemberEditAddressUpdateResponse, 
    type IMemberShippingAddressUpdateResponse, 
    type IUserAddress, 
} from '@misc';
import {
    CART_UPDATE,
    MEMBER_DELETE_ADDRESS_UPDATE,
    MEMBER_DELIVERY_METHOD_UPDATE,
    MEMBER_EDIT_ADDRESS_UPDATE,
    MEMBER_NEW_ADDRESS_UPDATE,
    MEMBER_SHIPPING_ADDRESS_UPDATE,
    PRODUCT_UPDATE
} from './event-keys'

interface IWsCartUpdate {
    type:typeof CART_UPDATE;
    payload:IAddToBagResponse;
}

interface IWsMemberShippingAddressUpdate {
    type:typeof MEMBER_SHIPPING_ADDRESS_UPDATE;
    payload:IMemberShippingAddressUpdateResponse;
}

interface IWsMemberDeliveryMethodUpdate {
    type:typeof MEMBER_DELIVERY_METHOD_UPDATE;
    payload:IMemberDeliveryMethodUpdateResponse;
}

interface IWsMemberNewAddressUpdate {
    type:typeof MEMBER_NEW_ADDRESS_UPDATE;
    payload:IUserAddress;
}

interface IWsMemberEditAddressUpdate {
    type:typeof MEMBER_EDIT_ADDRESS_UPDATE;
    payload:IMemberEditAddressUpdateResponse;
}

interface IWsMemberDeleteAddressUpdate {
    type:typeof MEMBER_DELETE_ADDRESS_UPDATE;
    payload:IMemberDeleteAddressUpdateResponse;
}

interface IWsProductUpdate {
    type:typeof PRODUCT_UPDATE;
    payload:IProduct[];
}

interface IWsPaymentUpdate {
    type:'payment_update';
    payload:'start'|'fail'|'success';
}

interface IWsSelectedCollectionPoint {
    type:'selected_collection_point_update';
    payload:number;
}

interface IWsPreferredCollectionPoint {
    type:'preferred_collection_point_update';
    payload:number;
}

export type IWsMessage = IWsCartUpdate 
    | IWsMemberShippingAddressUpdate 
    | IWsMemberDeliveryMethodUpdate
    | IWsMemberNewAddressUpdate
    | IWsMemberEditAddressUpdate
    | IWsMemberDeleteAddressUpdate
    | IWsProductUpdate
    | IWsPaymentUpdate
    | IWsSelectedCollectionPoint
    | IWsPreferredCollectionPoint