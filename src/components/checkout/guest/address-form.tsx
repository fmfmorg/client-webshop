import { createMemo, onCleanup, onMount } from 'solid-js'
import TextInput from "@components/input-fields/text-input";
import { dispatchInternalEvent, httpRequestHeader, sessionLost, type ICountry, type IDeliveryMethodMap, type INoServiceCountryMap } from "@misc";
import CountrySelect from '@components/account-addresses/country-select';
import { COUNTRY_CHANGED } from '@misc/event-keys';

const AddressForm = (
    p:{
        countries:ICountry[];
        userCountry?:string;
        idPrefix?:'shipping'|'billing';
        required?:boolean;
        noServiceCountryMap:INoServiceCountryMap;
    }
) => {
    const isShippingAddress = createMemo(()=>!!p.idPrefix && p.idPrefix === 'shipping')
    const initialCountry = createMemo(()=>{
        if (!p.userCountry) return 'GB'
        else if (isShippingAddress()) {
            const deliveryAvailableCountries = p.countries.filter(e=>e.deliveryAvailable).map(e=>e.id)
            return deliveryAvailableCountries.indexOf(p.userCountry) === -1 ? 'GB' : p.userCountry
        } else {
            const countries = p.countries.map(e=>e.id)
            return countries.indexOf(p.userCountry) === -1 ? 'GB' : p.userCountry
        }
    })

    const postcodeOnChange = async (ev:Event) => {
        const postcode = (ev.target as HTMLInputElement).value.toUpperCase().replaceAll(" ", '')
        const country = (document.getElementById('shipping-country') as HTMLSelectElement).value

        const resp = await fetch('/api/webshop/guest-shipping-country-on-change',{
            headers:httpRequestHeader(false,'client',true),
            method:"POST",
            body:JSON.stringify({country,postcode})
        })

        if (!resp.ok) {
            await sessionLost(resp.status)
            return
        }
        const {apiResponse}  = await resp.json() as {apiResponse:{deliveryMethodMap:IDeliveryMethodMap;selectedDeliveryID:number;}}
        dispatchInternalEvent(COUNTRY_CHANGED,apiResponse)
    }

    onMount(()=>{
        const postcodeElem = document.getElementById(`${p.idPrefix}-postcode`) as HTMLInputElement
        if (p.idPrefix === 'shipping') postcodeElem.addEventListener('change',postcodeOnChange,true)

        onCleanup(()=>{
            if (p.idPrefix === 'shipping') postcodeElem.removeEventListener('change',postcodeOnChange,true)
        })
    })

    return (
        <>
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='first-name' 
            name='first-name' 
            placeholder="First Name" 
            required={!!p.required}
            className='mb-8'
            maxLength={50}
        />
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='last-name' 
            name='last-name' 
            placeholder="Last Name" 
            required={!!p.required}
            className='mb-8'
            maxLength={50}
        />
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='street-line-1' 
            name='street-line-1' 
            placeholder="Address Line 1" 
            required={!!p.required}
            className='mb-8'
            maxLength={100}
        />
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='street-line-2' 
            name='street-line-2' 
            placeholder="Address Line 2" 
            required={false}
            className='mb-8'
            maxLength={100}
        />
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='city' 
            name='city' 
            placeholder="City" 
            required={!!p.required}
            className='mb-8'
            maxLength={50}
        />
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='region' 
            name='region' 
            placeholder="Region" 
            required={false}
            className='mb-8'
            maxLength={50}
        />
        <TextInput 
            idPrefix={p.idPrefix} 
            type='text' 
            id='postcode' 
            name='postcode' 
            placeholder="Postcode / ZIP Code" 
            required={!!p.required}
            className='mb-10'
            maxLength={20}
        />
        <CountrySelect 
            {...{
                countries:p.countries,
                noServiceCountryMap:p.noServiceCountryMap,
                idPrefix:p.idPrefix,
                selectedID:initialCountry()
            }} />
        </>
    )
}

export default AddressForm