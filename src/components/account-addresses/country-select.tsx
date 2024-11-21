import { For, onMount } from 'solid-js'
import { dispatchInternalEvent, httpRequestHeader, sessionLost, type ICountry, type IDeliveryMethodMap, type INoServiceCountryMap } from "@misc";
import { COUNTRY_CHANGED } from '@misc/event-keys';

const CountrySelect = (
    p:{
        countries:ICountry[];
        noServiceCountryMap:INoServiceCountryMap;
        selectedID?:string;
        idPrefix?:string;
    }
) => {
    let selectRef, noServicePhraseRef, noServiceCountryRef

    const addSelectMenuDivider = () => {
        const lineBreakElem = document.createElement("hr");
        const firstCountryOption = document.getElementById(!!p.idPrefix ? `${p.idPrefix}-${p.countries[0].id}` : p.countries[0].id) as HTMLOptionElement;
        selectRef.insertBefore(lineBreakElem,firstCountryOption)
    }

    const onSelectChange = async (e:Event) => {
        const countryID = (e.target as HTMLSelectElement).value
        const countryName = p.noServiceCountryMap[countryID]

        if (p.idPrefix === 'shipping') {
            const postcode = (document.getElementById('shipping-postcode') as HTMLInputElement).value.trim()
            const resp = await fetch('/api/webshop/guest-shipping-country-on-change',{
                headers:httpRequestHeader(false,'client',true,true),
                method:"POST",
                body:JSON.stringify({country:countryID,postcode})
            })
            if (!resp.ok) {
                await sessionLost(resp.status)
                return
            }
            const {apiResponse}  = await resp.json() as {apiResponse:{deliveryMethodMap:IDeliveryMethodMap;selectedDeliveryID:number;}}
            dispatchInternalEvent(COUNTRY_CHANGED,apiResponse)
        }
        if (p.idPrefix !== 'billing') {
            noServiceCountryRef.innerText = countryName || ''
            noServicePhraseRef.classList.toggle('invisible', !countryName)
        }
    }

    const onLoad = () => {
        if (!p.selectedID || p.idPrefix === 'billing') return
        const countryName = p.noServiceCountryMap[p.selectedID]
        noServiceCountryRef.innerText = countryName || ''
        noServicePhraseRef.classList.toggle('invisible', !countryName)
    }

    onMount(()=>{
        onLoad()
        addSelectMenuDivider()
    })

    return (
        <>
        <div class="relative border-b border-gray-300">
            <label for={!!p.idPrefix ? `${p.idPrefix}-country` : 'country'} class="absolute left-0 transition-all text-gray-600 font-light tracking-wider -top-5 text-xs text-black cursor-pointer">Country</label>
            <select 
                onChange={onSelectChange}
                ref={selectRef}
                name='country'
                id={!!p.idPrefix ? `${p.idPrefix}-country` : 'country'}
                class='w-full tracking-wider font-light outline-none leading-loose text-black [-webkit-appearance:none] [-moz-appearance:none] [appearance:none] bg-no-repeat bg-[length:9px] bg-[right_8px_center]'
                style={`background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='292.4' height='292.4'%3E%3Cpath fill='%23333' d='M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z'/%3E%3C/svg%3E")`}
            >
                <option value="GB" selected={!!p.selectedID && p.selectedID === 'GB'}>United Kingdom</option>
                <For each={p.countries} children={({id,name})=>(<option id={!!p.idPrefix ? `${p.idPrefix}-${id}` : id} value={id} selected={!!p.selectedID && p.selectedID === id}>{name}</option>)} />
            </select>
        </div>
        {!!p.idPrefix && p.idPrefix !== 'billing' && <p class='font-light text-sm tracking-wide invisible' ref={noServicePhraseRef}>* Currently we do not ship to <span ref={noServiceCountryRef}></span>.</p>}
        </>
    )
}

export default CountrySelect