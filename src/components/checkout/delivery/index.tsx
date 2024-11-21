import { httpRequestHeader, sessionLost, type IDeliveryMethodMap, type IMemberDeliveryMethodUpdateResponse } from "@misc"
import { createStore, produce } from 'solid-js/store'
import { createMemo, For, onMount, onCleanup, createSignal } from 'solid-js'
import DeliveryMethod from "./delivery-method";
import { cartSubtotal, guestDeliveryCost, signedIn, memberTotalToPay, deliveryAvailable, selectedCollectionPoint, memberDeliveryCost } from "@stores";
import { useStore } from "@nanostores/solid";
import { COUNTRY_CHANGED, MEMBER_DELIVERY_METHOD_UPDATE } from "@misc/event-keys";
const DeliveryMethods = (
    p:{
        shippingMethodsMap:IDeliveryMethodMap;
        selectedDeliveryID:number;
    }
) => {
    let containerRef

    const [selectedDeliveryID, setSelectedDeliveryID] = createSignal(p.selectedDeliveryID)
    const [deliveryMethodMap, setDeliveryMethodMap] = createStore(p.shippingMethodsMap)
    const deliveryMethods = createMemo(()=>!!Object.values(deliveryMethodMap) ? Object.values(deliveryMethodMap).sort((a,b)=>a.cost - b.cost) : [])
    const $selectCollectionPoint = useStore(selectedCollectionPoint)
    const deliveryRadioRequired = createMemo(()=>$selectCollectionPoint() === 1)

    const shippingCountryOnChange = (e:CustomEvent) => {
        const {deliveryMethodMap: _deliveryMethodMap, selectedDeliveryID: _selectedDeliveryID} = e.detail as {deliveryMethodMap:IDeliveryMethodMap;selectedDeliveryID:number}
        setDeliveryMethodMap(produce(c=>{
            const newIDs = Object.keys(_deliveryMethodMap)
            const idsToRemove = Object.keys(c).filter(d=>newIDs.indexOf(d) === -1)

            if (!!idsToRemove.length) idsToRemove.forEach(d=>{
                c[d] = undefined
            })

            newIDs.forEach(d=>{
                c[d] = _deliveryMethodMap[d]
            })
        }))
        
        const radioInput = document.getElementById(`delivery-method-${_selectedDeliveryID}`) as HTMLInputElement
        if (!!radioInput) radioInput.click()

        deliveryAvailable.set(!!Object.keys(deliveryMethodMap).length)
    }

    const handleResponse = (e:IMemberDeliveryMethodUpdateResponse) => {
        const { total, deliveryMethodID, deliveryCost } = e
        memberDeliveryCost.set(deliveryCost)
        memberTotalToPay.set(total)

        const radioInput = document.getElementById(`delivery-method-${deliveryMethodID}`) as HTMLInputElement
        if (!!radioInput) radioInput.checked = true
        setSelectedDeliveryID(deliveryMethodID)
    }

    const deliveryMethodOnClick = (id:number) => async() => {
        if (signedIn.get()){
            const resp = await fetch(`/api/webshop/member-delivery-method-on-change/${id}`,{
                headers:httpRequestHeader(false,'client',true,true),
            })
            if (!resp.ok) {
                if (await sessionLost(resp.status)) return
                const radioInput = document.getElementById(`delivery-method-${selectedDeliveryID()}`) as HTMLInputElement
                if (!!radioInput) radioInput.checked = true
                return 
            }
            const {apiResponse} = await resp.json() as {apiResponse:IMemberDeliveryMethodUpdateResponse}
            handleResponse(apiResponse)
        } else {
            const deliveryMethod = deliveryMethodMap[id]
            if (!deliveryMethod) return
            const { cost, minSpendForFree } = deliveryMethod
            if (minSpendForFree !== 0 && cartSubtotal.get() >= minSpendForFree) guestDeliveryCost.set(0)
            else guestDeliveryCost.set(cost)

            setSelectedDeliveryID(id)
        }
    }

    const wsMsgHandler = (e:CustomEvent) => handleResponse(e.detail as IMemberDeliveryMethodUpdateResponse)

    const cartSubtotalOnChange = (e:number) => {
        if (selectedCollectionPoint.get() !== 1) {
            guestDeliveryCost.set(0)
            memberTotalToPay.set(e)
            return
        }
        const deliveryMethod = deliveryMethodMap[selectedDeliveryID()]
        if (!!deliveryMethod){
            const { cost, minSpendForFree } = deliveryMethod
            if (minSpendForFree !== 0 && e >= minSpendForFree) guestDeliveryCost.set(0)
            else guestDeliveryCost.set(cost)
        }
    }

    const collectionPointOnChange = (addressID:number) => {
        if (addressID !== 1) {
            guestDeliveryCost.set(0)
            memberTotalToPay.set(cartSubtotal.get())
            return
        }
        const deliveryMethod = deliveryMethodMap[selectedDeliveryID()]
        if (!!deliveryMethod){
            const { cost, minSpendForFree } = deliveryMethod
            if (minSpendForFree !== 0 && cartSubtotal.get() >= minSpendForFree) guestDeliveryCost.set(0)
            else guestDeliveryCost.set(cost)
        }
    }

    onMount(()=>{
        deliveryAvailable.set(!!Object.keys(p.shippingMethodsMap).length)
        document.addEventListener(COUNTRY_CHANGED,shippingCountryOnChange,true)
        document.addEventListener(MEMBER_DELIVERY_METHOD_UPDATE,wsMsgHandler,true)

        cartSubtotal.subscribe(cartSubtotalOnChange)
        selectedCollectionPoint.subscribe(collectionPointOnChange)

        onCleanup(()=>{
            document.removeEventListener(COUNTRY_CHANGED,shippingCountryOnChange,true)
            document.removeEventListener(MEMBER_DELIVERY_METHOD_UPDATE,wsMsgHandler,true)
        })
    })

    return (
        <>
        <div ref={containerRef} class={`pt-2 mt-4 ${!deliveryMethods().length ? 'hidden' : ''}`} id='delivery-methods'>
            <div class='uppercase text-xs tracking-widest xs:text-sm xs:tracking-[0.2rem] mb-2'>
                B. Delivery Method
            </div>
            <For 
                each={deliveryMethods()}
                children={e=>(
                    <DeliveryMethod {...{
                        ...e,
                        checked:e.id === selectedDeliveryID(),
                        onInput:deliveryMethodOnClick(e.id),
                        required:deliveryRadioRequired()
                    }} />
                )}
            />
        </div>
        </>
    )
}

export default DeliveryMethods