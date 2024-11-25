import type { IAddToBagResponse } from "@components/cart/interfaces";
import { 
    dispatchInternalEvent,
    httpRequestHeader,
    sessionLost,
    showErrorModal,
    websocketUrl,
    type IDeliveryMethodMap,
    type IMdwResponse,
    type IUserAddressMap,
} from "@misc";
import { 
    cartSubtotal,
    checkoutOrderID, 
    guestDeliveryCost, 
    memberTotalToPay, 
    otherClientPaymentInProcess, 
    preferredCollectionPoint, 
    selectedCollectionPoint, 
    signedIn, 
    thisClientPaymentInProcess,
} from "@stores";
import type { IWsMessage } from "./misc/ws-interfaces";
import { BACK_ONLINE_ADDRESS_LIST, COUNTRY_CHANGED, UPDATE_CART_ITEM_MAP } from "@misc/event-keys";

let cartID = '', isCheckoutPage = false, ws:WebSocket = null

const fetchKey = async() => {
    const resp = await fetch('/api/webshop/get-key',{
        headers:{
            "X-Request-Source":"WS",
        }
    })
    if (!resp.ok) return false
    cartID = await resp.text()
    return true
}

const wsMsgHandler = (msg:IWsMessage) => {
    switch (msg.type){
        case 'payment_update':
            wsPaymentUpdate(msg.payload)
            break
        case 'selected_collection_point_update':
            wsSelectedCollectionPointUpdate(msg.payload)
            break
        case 'preferred_collection_point_update':
            wsPreferredCollectionPointUpdate(msg.payload)
            break
        default: 
            dispatchInternalEvent(msg.type,msg.payload)
            break
    }
}

const launchWs = () => {
    if (cartID === '') return

    // ws = new WebSocket(`${ websocketUrl }/ws?key=${cartID}`)
    ws = new WebSocket(`wss://server-ws.fairymade.co/ws?key=${cartID}`)
    ws.onmessage = (e) => wsMsgHandler(JSON.parse(e.data) as IWsMessage)
}

const launchWsAtInit = async () => {
    isCheckoutPage = window.location.pathname === '/checkout'
    const success = await fetchKey()
    if (!success) {
        showErrorModal('Server error. Please refresh the page later.')
        return
    }
    launchWs()
}

const closeWs = () => {
    ws.close()
    ws = null
    window.addEventListener('online',backOnline,true)
    window.removeEventListener('offline',closeWs,true)
}

const backOnline = async () => {
    if (isCheckoutPage){
        if (signedIn.get()){
            const resp = await fetch('/api/webshop/internet-back-checkout-page-member',{
                headers:httpRequestHeader(true,'client',true,true)
            })
            if (!resp.ok) {
                window.location.reload()
                return
            }
            const {
                mdwResponse:{
                    cartContent: _cartContent,
                    cartItemMap: _cartItemMap,
                    cartProductDetailsMap,
                    paymentInProcess,
                }, apiResponse:{
                    addressMap,
                    selectedAddressID,
                    deliveryMethodMap,
                    selectedDeliveryID,
                    total
                }
            } = await resp.json() as {
                mdwResponse:IMdwResponse;
                apiResponse:{
                    addressMap:IUserAddressMap;
                    selectedAddressID:string;
                    userCountry:string;
                    deliveryMethodMap:IDeliveryMethodMap;
                    selectedDeliveryID:number;
                    total:number;
                };
            }
            otherClientPaymentInProcess.set(paymentInProcess)
            updateCartItemMap({
                cartContent: _cartContent,
                cartItemMap: _cartItemMap,
                total,
                productDetails:Object.values(cartProductDetailsMap)
            })

            dispatchInternalEvent(BACK_ONLINE_ADDRESS_LIST,{
                addressMap,
                selectedAddressID,
                deliveryMethodMap,
                selectedDeliveryID,
            })
        } else {
            const shippingPostcode = (document.getElementById('shipping-postcode') as HTMLInputElement).value 
            const shippingCountry = (document.getElementById('shipping-country') as HTMLSelectElement).value
            const resp = await fetch('/api/webshop/internet-back-checkout-page-guest',{
                headers:httpRequestHeader(true,'client',true,true),
                method:"POST",
                body:JSON.stringify({country:shippingCountry,postcode:shippingPostcode})
            })
            if (!resp.ok) {
                window.location.reload()
                return
            }
            const {
                mdwResponse:{
                    cartContent: _cartContent,
                    cartItemMap: _cartItemMap,
                    cartProductDetailsMap,
                    paymentInProcess,
                }, apiResponse:{
                    deliveryMethodMap,
                    selectedDeliveryID,
                }
            } = await resp.json() as {
                mdwResponse:IMdwResponse;
                apiResponse:{
                    deliveryMethodMap:IDeliveryMethodMap;
                    selectedDeliveryID:number;
                };
            }
            otherClientPaymentInProcess.set(paymentInProcess)
            updateCartItemMap({
                cartContent: _cartContent,
                cartItemMap: _cartItemMap,
                total:0,
                productDetails:Object.values(cartProductDetailsMap)
            })

            dispatchInternalEvent(COUNTRY_CHANGED,{deliveryMethodMap,selectedDeliveryID})
        }
    } else {
        const resp = await fetch('/api/webshop/internet-back-non-checkout-page',{
            headers:httpRequestHeader(true,'client',true,true)
        })
        if (!resp.ok) {
            const sessionIsLost = await sessionLost(resp.status)
            if (!sessionIsLost) window.location.reload()
            return
        }
        const {mdwResponse:{
            cartContent: _cartContent,
            cartItemMap: _cartItemMap,
            cartProductDetailsMap,
            paymentInProcess,
            signedIn:_signedIn
        }} = await resp.json() as {mdwResponse:IMdwResponse}
        if (_signedIn !== signedIn.get()) {
            window.location.reload()
            return
        }
        otherClientPaymentInProcess.set(paymentInProcess)
        updateCartItemMap({
            cartContent: _cartContent,
            cartItemMap: _cartItemMap,
            total:0,
            productDetails:Object.values(cartProductDetailsMap)
        })
    }
    launchWs()
    window.removeEventListener('online',backOnline,true)
    window.addEventListener('offline',closeWs,true)
}

if (typeof window !== 'undefined'){
    window.addEventListener('load',launchWsAtInit,{once:true})
    window.addEventListener('offline',closeWs,true)
    
}

export const wsSendMessage = (e:string) => {
    if (!!ws && ws.readyState === WebSocket.OPEN) ws.send(e)
}

type ICartApiResponse = {success?:boolean} & IAddToBagResponse

const updateCartItemMap = (e:ICartApiResponse) => dispatchInternalEvent(UPDATE_CART_ITEM_MAP,e)

const wsPaymentUpdate = async (e:'start'|'fail'|'success') => {
    if (thisClientPaymentInProcess.get()){
        const orderID = checkoutOrderID.get()
        if (e === 'success' && orderID !== 0) window.location.assign(`/track-order?order=${orderID}`)
    } else otherClientPaymentInProcess.set(e === 'start')
}

const wsSelectedCollectionPointUpdate = (e:number) => {
    selectedCollectionPoint.set(e)
    const clickCollectCheckbox = document.getElementById('collect') as HTMLInputElement
    const homeDeliveryCheckbox = document.getElementById('delivery') as HTMLInputElement
    if (!clickCollectCheckbox || !homeDeliveryCheckbox) return

    if (e===1) homeDeliveryCheckbox.checked = true
    else if (e > 1) {
        clickCollectCheckbox.checked = true
        guestDeliveryCost.set(0)
        memberTotalToPay.set(cartSubtotal.get())
    } else {
        clickCollectCheckbox.checked = false
        homeDeliveryCheckbox.checked = false
        guestDeliveryCost.set(0)
        memberTotalToPay.set(cartSubtotal.get())
    }
}

const wsPreferredCollectionPointUpdate = (e:number) => preferredCollectionPoint.set(e)