import type { ICountry, INoServiceCountryMap } from "@misc";
import AddressForm from "./address-form"
import { useStore } from "@nanostores/solid";
import { selectedCollectionPoint } from "@stores";

const GuestShipping = (
    {
        countries,
        userCountry,
        noServiceCountryMap,
        hasPOS
    }:{
        countries:ICountry[];
        userCountry:string;
        noServiceCountryMap:INoServiceCountryMap;
        hasPOS:boolean;
    }
) => {
    const $selectedCollectionPoint = useStore(selectedCollectionPoint)

    return (
        <div class={hasPOS ? "mt-4" : 'mt-2'}>
            <div class='uppercase text-xs tracking-widest xs:text-sm xs:tracking-[0.2rem] mb-6'>
                A. Shipping Address
            </div>
            <AddressForm 
                {...{
                    idPrefix:'shipping',
                    countries,
                    userCountry,
                    noServiceCountryMap
                }} 
                required={$selectedCollectionPoint() === 1}
            />
        </div>
    )
}

export default GuestShipping