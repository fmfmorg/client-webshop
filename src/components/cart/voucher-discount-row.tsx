import { dispatchInternalEvent, httpRequestHeader } from "@misc";
import type { IAddToBagResponse } from "./interfaces";
import { CART_UPDATE } from "@misc/event-keys";

const VoucherDiscountRow = (p:{
    text:string;
    discountAmount:string;
    voucherID:number;
    voucherType:number;
}) => {
    let removeBtnRef

    const voucherCodeOnRemove = async() => {
        removeBtnRef.innerText = 'removing...'
        removeBtnRef.classList.add('cursor-not-allowed')
        removeBtnRef.disabled = true

        const resp = await fetch('/api/webshop/voucher-code-on-remove',{
            method:"POST",
            headers:httpRequestHeader(false,'client',true,true),
            body:JSON.stringify({type:p.voucherType})
        })

        if (!resp.ok) {
            removeBtnRef.innerText = 'remove'
            removeBtnRef.classList.remove('cursor-not-allowed')
            removeBtnRef.disabled = false
            return
        }

        const {apiResponse} = await resp.json() as {apiResponse:IAddToBagResponse}
        dispatchInternalEvent(CART_UPDATE, apiResponse)
    }

    return (
        <div class='table-row'>
            <div class='table-cell'>
                <div class='flex space-x-2'>
                    <p>{p.text}</p>
                    <button ref={removeBtnRef} onClick={voucherCodeOnRemove} type='button' class='text-2xs font-semibold tracking-wider uppercase bg-gray-300 px-2 rounded-sm mouse:hover:underline'>remove</button>
                </div>
            </div>
            <div class='table-cell text-right text-red-700 font-semibold'>{p.discountAmount}</div>
        </div>
    )
}

export default VoucherDiscountRow