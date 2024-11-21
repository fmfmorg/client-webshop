import { createMemo } from 'solid-js'
import { formatPriceInteger, type IDeliveryMethod } from "@misc";
import { cartSubtotal, selectedCollectionPoint } from '@stores';
import { useStore } from '@nanostores/solid';

const DeliveryMethod = (p:IDeliveryMethod & {checked:boolean; onInput:()=>void;required:boolean;}) => {
    const _cartSubtotal = useStore(cartSubtotal)
    const deliveryCostAmount = createMemo(()=>p.minSpendForFree === 0 || _cartSubtotal() < p.minSpendForFree ? !!p.cost ? formatPriceInteger(p.cost) : 'FREE' : 'FREE')
    const showMinSpend = createMemo(()=>!!p.minSpendForFree && _cartSubtotal() < p.minSpendForFree)

    return (
        <label for={`delivery-method-${p.id}`} class='cursor-pointer mb-2 border border-gray-300 rounded-md flex p-2 text-sm tracking-wider text-gray-500 has-[:checked]:text-black has-[:checked]:border-black has-[:checked]:bg-gray-200'>
            <input 
                onInput={[p.onInput]} 
                type='radio' 
                name='delivery-method' 
                id={`delivery-method-${p.id}`} 
                value={p.id} 
                class='peer appearance-none h-1 w-1 mt-2 ml-1 mr-3 rounded-full border-2 border-white outline-none ring-gray-700 checked:ring-4' 
                checked={p.checked} 
                required={p.required}
            />
            <div class='w-full'>
                <div class='flex justify-between'>
                    <p class='font-semibold'>{p.name}</p>
                    <p class='font-semibold'>{deliveryCostAmount()}</p>
                </div>
                {showMinSpend() && 
                    <p class='text-[0.7rem] uppercase tracking-widest'>Free for order over {formatPriceInteger(p.minSpendForFree)}</p>
                }
            </div>
        </label>
    )
}

export default DeliveryMethod