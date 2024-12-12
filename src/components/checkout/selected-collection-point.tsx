import type { IShopAddressMap } from "@misc";
import { createMemo } from 'solid-js'
import { selectedCollectionPoint } from "@stores";
import { useStore } from "@nanostores/solid";

const SelectedCollectionPoint = (p:{shopAddressMap:IShopAddressMap;}) => {
    const collectionPoint = useStore(selectedCollectionPoint)
    const addressLine = createMemo(()=>{
        const address = p.shopAddressMap[collectionPoint()] //p.shopAddresses.find(e=>e.id === collectionPoint())
        if (!address) return ''
        const {line1,line2,city,stateProvince,postcode} = address
        return [line1,line2,city,stateProvince,postcode].filter(e=>!!e).join(', ')
    })

    return (
        <div class={collectionPoint() < 2 ? 'hidden' : ''}>
            <p class='text-xs xs:text-sm font-light'>{addressLine()}</p>
            {Object.keys(p.shopAddressMap).length > 1 && <p class='text-2xs uppercase font-semibold underline mt-2 tracking-widest'>Click here to reselect collection point</p>}
        </div>
    )
}

export default SelectedCollectionPoint