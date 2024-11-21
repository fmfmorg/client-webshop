import { createMemo } from 'solid-js'
import type { INoServiceCountryMap, IUserAddressMap } from "@misc";
import AddressList from "./address-list";
import AddNewAddressBtn from "./add-new-address-btn";
import { useStore } from "@nanostores/solid";
import { selectedCollectionPoint } from "@stores";

const MemberShippingAddresses = (
    p:{
        addressMap:IUserAddressMap;
        selectedAddressID:string;
        noServiceCountryMap: INoServiceCountryMap;
        hasPOS:boolean;
    }
) => {
    const $selectCollectionPoint = useStore(selectedCollectionPoint)
    const shippingAddressRequired = createMemo(()=>$selectCollectionPoint() === 1)
    return (
        <>
        <div class={`uppercase text-xs tracking-widest xs:text-sm xs:tracking-[0.2rem] ${p.hasPOS ? "mt-4" : 'mt-2'}`}>
            A. Shipping Address
        </div>
        <AddressList 
            addressMap={p.addressMap} 
            selectedAddressID={p.selectedAddressID} 
            noServiceCountryMap={p.noServiceCountryMap}
            idPrefix='shipping' 
            required={shippingAddressRequired()}
        />
        <AddNewAddressBtn idPrefix='shipping' />
        </>
    )
}

export default MemberShippingAddresses