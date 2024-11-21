import { onMount, onCleanup, createMemo, For } from 'solid-js'
import { createStore, produce } from 'solid-js/store';
import type { IAddToBagResponse, ICartContent } from "@components/cart/interfaces";
import { ADD_TO_BAG_FROM_CATALOGUE, CART_UPDATE, TEXT_INPUT_SET_NEW_VALUE, UPDATE_CART_ITEM_MAP } from '@misc/event-keys';
import { dispatchInternalEvent, formatPrice, httpRequestHeader } from '@misc';
import DiscountRow from '@components/cart/discount-row';
import { useStore } from '@nanostores/solid';
import { guestDeliveryCost, guestTotalToPay, memberDeliveryCost, memberTotalToPay, signedIn } from '@stores';
import TextInput from '@components/input-fields/text-input';
import VoucherDiscountRow from '@components/cart/voucher-discount-row';

const OrderSummary = (
    {
        cartCalculation,
    }:{
        cartCalculation:ICartContent;
    }
) => {
    let discountCodeErrorRef
    const [cartContent, setCartContent] = createStore(cartCalculation)
    const $signedIn = useStore(signedIn)
    const $memberDeliveryCost = useStore(memberDeliveryCost)
    const $guestDeliveryCost = useStore(guestDeliveryCost)
    const $memberTotalToPay = useStore(memberTotalToPay)
    const $guestTotalToPay = useStore(guestTotalToPay)

    const deliveryCost = createMemo(()=>$signedIn() ? $memberDeliveryCost() : $guestDeliveryCost())
    const totalToPay = createMemo(()=>$signedIn() ? $memberTotalToPay() : $guestTotalToPay())

    const hasDiscount = createMemo(()=>
        !!cartContent.campaignDiscounts && !!cartContent.campaignDiscounts.length 
        || !!cartContent.voucherDiscounts && !!cartContent.voucherDiscounts.length
        || !!cartContent.staffDiscount
        || !!cartContent.memberDiscount
    )

    const subtotal = createMemo(()=>{
        let result = cartContent.subtotalBeforeDelivery + cartContent.memberDiscount + cartContent.staffDiscount
        if (!cartContent.campaignDiscounts && !cartContent.voucherDiscounts) return result

        if (!!cartContent.campaignDiscounts){
            const campaignDiscountLen = cartContent.campaignDiscounts.length
            for (let i=0; i<campaignDiscountLen; i++) {
                result += cartContent.campaignDiscounts[i].amount
            }
        }

        if (!!cartContent.voucherDiscounts){
            const voucherDiscountLen = cartContent.voucherDiscounts.length
            for (let i=0; i<voucherDiscountLen; i++) {
                result += cartContent.voucherDiscounts[i].amount
            }
        }

        return result
    })

    const updateCartItemMap = (e:IAddToBagResponse) => {
        const { cartContent: _cartContent } = e

        setCartContent(produce(c=>{
            Object.entries(_cartContent).forEach(([k,v])=>{
                if (k === 'campaignDiscounts' || k === 'voucherDiscounts') c[k] = !!v ? [...v] : []
                else c[k] = v
            });
        }));
    }

    const onUpdateCartItemMap = (ev:CustomEvent) => {
        const e = ev.detail as IAddToBagResponse
        updateCartItemMap(e)
    }

    const discountCodeOnSubmit = async() => {
        const discountCodeElem = document.getElementById('discount-code') as HTMLInputElement
        if (!discountCodeElem) return
        const discountCode = discountCodeElem.value.trim().toUpperCase()
        
        const resp = await fetch(`/api/webshop/voucher-code-on-input/${encodeURIComponent(discountCode)}`,{
            headers:httpRequestHeader(false,'client',true,true)
        })

        if (resp.ok){
            const {apiResponse} = await resp.json() as {apiResponse:IAddToBagResponse}
            updateCartItemMap(apiResponse)
            discountCodeErrorRef.classList.add('hidden')
        } else {
            switch (resp.status) {
                case 400:
                    discountCodeErrorRef.innerText = `Discount code ${discountCode} is not applicable.`
                    discountCodeErrorRef.classList.remove('hidden')
                    break
                case 500:
                    discountCodeErrorRef.innerText = 'Server error. Please try again later.'
                    discountCodeErrorRef.classList.remove('hidden')
                    break
                default: break
            }
        }

        discountCodeElem.value = ''
        dispatchInternalEvent(TEXT_INPUT_SET_NEW_VALUE,{id:discountCodeElem.id,value:''})
    }
 
    onMount(()=>{
        document.addEventListener(ADD_TO_BAG_FROM_CATALOGUE, onUpdateCartItemMap, true);
        document.addEventListener(UPDATE_CART_ITEM_MAP, onUpdateCartItemMap, true);
        document.addEventListener(CART_UPDATE,onUpdateCartItemMap, true)

        onCleanup(()=>{
            document.removeEventListener(ADD_TO_BAG_FROM_CATALOGUE, onUpdateCartItemMap,true);
            document.removeEventListener(UPDATE_CART_ITEM_MAP, onUpdateCartItemMap,true);
            document.removeEventListener(CART_UPDATE,onUpdateCartItemMap,true)
        })
    })

    return (
        <>
            <div class='uppercase text-xs tracking-widest xs:text-sm xs:tracking-[0.2rem] mb-3'>
                5. Order Summary
            </div>
            <div class='divide-y'>
                <div class='table w-full p-2 pt-0 text-sm font-light'>
                    <div class='table-row-group'>
                        <div class='table-row font-semibold tracking-wide'>
                            <div class='table-cell'>Subtotal</div>
                            <div class='table-cell text-right'>{formatPrice(subtotal())}</div>
                        </div>
                        <For 
                            each={cartContent.campaignDiscounts}
                            children={e=><DiscountRow text={e.name} discountAmount={formatPrice(e.amount * -1)} />}
                        />
                        <For 
                            each={cartContent.voucherDiscounts}
                            children={e=><VoucherDiscountRow text={`Discount - ${e.code}`} discountAmount={formatPrice(e.amount * -1)} voucherID={e.id} voucherType={e.type} />}
                        />
                        {!!cartContent.memberDiscount && <DiscountRow text={`Member discount: ${cartContent.memberDiscountRate}% off`} discountAmount={formatPrice(cartContent.memberDiscount * -1)} />}
                        {!!cartContent.staffDiscount && <DiscountRow text='Staff discount' discountAmount={formatPrice(cartContent.staffDiscount * -1)} />}
                        {!hasDiscount() && 
                            <div class='table-row'>
                                <div class='table-cell'>Shipping</div>
                                <div class={`table-cell text-right ${!!deliveryCost() ? '' : 'tracking-widest text-xs font-normal'}`.trim()}>{!!deliveryCost() ? formatPrice(deliveryCost()) : 'FREE'}</div>
                            </div>
                        }
                    </div>
                </div>
                {hasDiscount() && <div class='table w-full p-2 text-sm font-light'>
                    <div class='table-row-group'>
                        <div class='table-row font-semibold tracking-wide'>
                            <div class='table-cell'>Subtotal after discounts</div>
                            <div class='table-cell text-right'>{formatPrice(cartContent.subtotalBeforeDelivery)}</div>
                        </div>
                        <div class='table-row'>
                            <div class='table-cell'>Shipping</div>
                            <div class={`table-cell text-right ${!!deliveryCost() ? '' : 'tracking-widest text-xs font-normal'}`.trim()}>{!!deliveryCost() ? formatPrice(deliveryCost()) : 'FREE'}</div>
                        </div>
                    </div>
                </div>}
                <div class='table w-full p-2 pb-0 text-sm font-light'>
                    <div class='table-row-group'>
                        <div class='table-row font-semibold text-xl tracking-widest'>
                            <div class='table-cell uppercase'>Total</div>
                            <div class='table-cell text-right'>{formatPrice(totalToPay())}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class='rounded-lg border-2 border-black px-2 mt-6'>
                <div class='flex space-x-2'>
                    <TextInput {...{
                        type:'text',
                        placeholder:'Discount Code',
                        id:'discount-code',
                        name:'discount-code',
                        className:'w-full pb-2 pt-1',
                        maxLength:50,
                        highlightLabel:true
                    }} />
                    <button 
                        onClick={discountCodeOnSubmit}
                        type='button' 
                        class='uppercase bg-black my-2 px-2 text-xs tracking-widest text-white rounded-md'
                    >Apply</button>
                </div>
                <p ref={discountCodeErrorRef} class='text-xs pb-2 text-red-700 font-semibold tracking-wide hidden' />
            </div>
        </>
    )
}

export default OrderSummary