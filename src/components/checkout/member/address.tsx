import type { IUserAddress } from "@misc"

const Address = (
    p:{
        address:IUserAddress;
        checked:boolean;
        idPrefix:'shipping'|'billing';
        onClick:()=>void;
        editBtnOnClick:()=>void;
        required:boolean;
        disabled?:boolean;
    }
) => (
    <label 
        for={`${p.idPrefix}-${p.address.id}`} 
        class='cursor-pointer has-[:disabled]:cursor-not-allowed flex my-2 p-2 border border-gray-300 rounded-md has-[:checked]:border-black has-[:checked]:bg-gray-200'
    >
        <div class='flex flex-col justify-start ml-1 mr-3 pt-2.5'>
            <input 
                onInput={[p.onClick]}
                type='radio' 
                name={`${p.idPrefix}-address`} 
                id={`${p.idPrefix}-${p.address.id}`} 
                checked={p.checked} 
                value={p.address.id}
                class='appearance-none h-1 w-1 rounded-full border-2 border-white outline-none ring-gray-700 checked:ring-4'
                required={p.required}
                disabled={!!p.disabled}
            />
        </div>
        <div class='text-sm font-light tracking-wide'>
            <p class='font-semibold mb-1'>{`${p.address.firstName} ${p.address.lastName}`.trim()}</p>
            {!!p.address.line1 && <p>{p.address.line1}</p>}
            {!!p.address.line2 && <p>{p.address.line2}</p>}
            <p>{[p.address.city,p.address.stateProvince,p.address.postcode].filter(e=>!!e).join(', ')}</p>
            <p>{p.address.countryName}</p>
            <button type='button' onClick={p.editBtnOnClick} class='uppercase text-xs text-gray-500 font-semibold tracking-widest border-b border-transparent mouse:hover:border-black mouse:hover:text-black mt-2'>Edit</button>
            {!!p.disabled && <p class='italic text-red-700 text-xs font-normal mt-3'>Currently we do not ship to {p.address.countryName}.</p>}
        </div>
    </label>
)

export default Address