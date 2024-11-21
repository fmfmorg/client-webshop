import { onMount } from "solid-js";
import { type JSX } from "solid-js";

const Checkbox = (
    {
        name,
        id,
        required,
        idPrefix,
        checked,
        children,
    }:{
        name:string;
        id:string;
        required?:boolean;
        idPrefix?:string;
        checked?:boolean;
        children?:JSX.Element;
    }
) => {
    onMount(()=>{
        const billingSameAsShippingCheckboxContainer = document.getElementById("billing-same-as-shipping-checkbox-container") as HTMLDivElement
        if (id === 'same-as-shipping') {
            const ev = new CustomEvent('show',{detail:!!idPrefix ? `${idPrefix}-${id}` : id})
            billingSameAsShippingCheckboxContainer.dispatchEvent(ev)
        }
    })
    return (
        <label class='relative cursor-pointer' for={!!idPrefix ? `${idPrefix}-${id}` : id}>
            <input 
                // hidden 
                type='checkbox' 
                id={!!idPrefix ? `${idPrefix}-${id}` : id} 
                name={name} 
                required={!!required} 
                class='peer opacity-0 absolute'
                checked={!!checked}
            />
            <svg viewBox='0 0 100 100' class='h-4 w-4 peer-checked:[&>polyline]:inline absolute top-px' stroke='black' fill='none'>
                <polyline points="15,50 40,80 80,20" stroke-width='10' class='hidden' />
                <rect x='5' y='5' width="90" height="90" rx="10" stroke-width='5' />
            </svg>
            {children}
        </label>
    )
}

export default Checkbox