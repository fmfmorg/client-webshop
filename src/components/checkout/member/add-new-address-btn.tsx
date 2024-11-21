const AddNewAddressBtn = (p:{idPrefix:'billing'|'shipping'}) => (
    <>
    <label class="cursor-pointer" for={`${p.idPrefix}-checkout-new-address`}>
        <div class={`flex justify-center p-1 border border-gray-300 rounded-md text-gray-500 ${p.idPrefix === 'shipping' ? 'mb-6' : ''} stroke-gray-500 mouse:hover:text-black mouse:hover:border-black mouse:hover:stroke-black`}>
            <div class="flex flex-col justify-center mr-2">
                <svg viewBox="0 0 100 100" height="0.8rem" fill="none" stroke-width="0.7rem">
                    <line x1="5" y1="50" x2="95" y2="50" />
                    <line x1="50" y1="5" x2="50" y2="95" />
                </svg>
            </div>
            <p class="uppercase text-sm tracking-widest [word-spacing:0.2rem] ">
                Add new address
            </p>
        </div>
    </label>
    </>
)

export default AddNewAddressBtn