import { createSignal, onMount, onCleanup } from 'solid-js'
import type { IUserAddressMap } from "@misc";
import AddressList from "./address-list";
import AddNewAddressBtn from "./add-new-address-btn";


const idPrefix:'billing' = 'billing'

const MemberBillingAddresses = (
    p:{
        addressMap:IUserAddressMap;
        selectedAddressID:string;
    }
) => {
    const [billingSameAsShipping,setBillingSameAsShipping] = createSignal(true)
    const toggleSameAsShipping = () => setBillingSameAsShipping(!billingSameAsShipping())

    onMount(()=>{
        const sameAsShippingCheckbox = document.getElementById(`${idPrefix}-same-as-shipping`) as HTMLInputElement
        setBillingSameAsShipping(sameAsShippingCheckbox.checked)
        if (!!sameAsShippingCheckbox) sameAsShippingCheckbox.addEventListener('click',toggleSameAsShipping,true)

        onCleanup(()=>{
            if (!!sameAsShippingCheckbox) sameAsShippingCheckbox.removeEventListener('click',toggleSameAsShipping,true)
        })
    })

    return (
        <>
        <AddressList 
            addressMap={p.addressMap} 
            selectedAddressID={p.selectedAddressID} 
            idPrefix={idPrefix} 
            required={!billingSameAsShipping()} 
        />
        <AddNewAddressBtn {...{idPrefix}} />
        </>
    )
}

export default MemberBillingAddresses