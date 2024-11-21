import { createSignal, onMount, onCleanup } from 'solid-js'
import AddressForm from '@components/checkout/guest/address-form';
import type { ICountry, INoServiceCountryMap } from '@misc';

const GuestBillingAddress = (
    p:{
        countries:ICountry[];
        userCountry?:string;
        noServiceCountryMap:INoServiceCountryMap;
    }
) => {
    const idPrefix = 'billing'
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
        <div class='mt-6'>
            <AddressForm 
                countries={p.countries} 
                noServiceCountryMap={p.noServiceCountryMap} 
                idPrefix={idPrefix} 
                required={!billingSameAsShipping()} 
                userCountry={p.userCountry} 
            />
        </div>
    )
}

export default GuestBillingAddress