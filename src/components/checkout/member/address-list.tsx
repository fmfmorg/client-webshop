import { createStore, produce } from 'solid-js/store'
import { createMemo, For, onMount, onCleanup, createSignal, createEffect } from 'solid-js'
import { dispatchInternalEvent, httpRequestHeader, sessionLost, type IMemberDeleteAddressUpdateResponse, type IMemberEditAddressUpdateResponse, type IMemberShippingAddressUpdateResponse, type IUserAddress, type IUserAddressMap } from "@misc"
import Address from './address';
import { memberTotalToPay, userAlreadyHasAddress } from '@stores';
import { memberSetBillingAddress } from './member-set-billing-address';
import type { IMemberAddressUpdateAfterDisconnectedResponse, INoServiceCountryMap } from 'src/misc/interfaces';
import { BACK_ONLINE_ADDRESS_LIST, COUNTRY_CHANGED, MEMBER_DELETE_ADDRESS_UPDATE, MEMBER_EDIT_ADDRESS_UPDATE, MEMBER_NEW_ADDRESS_UPDATE, MEMBER_SHIPPING_ADDRESS_UPDATE, OPEN_EDIT_ADDRESS_MODAL } from '@misc/event-keys';

const AddressList = (
    p:{
        addressMap:IUserAddressMap;
        selectedAddressID:string;
        idPrefix:'shipping'|'billing';
        required:boolean;
        noServiceCountryMap?: INoServiceCountryMap
    }
) => {
    let containerRef
    const [addressMap, setAddressMap] = createStore(p.addressMap)
    const addresses = createMemo(()=>!!Object.values(addressMap).length ? Object.values(addressMap).map(e=>e) : [])
    const defaultAddressID = createMemo(()=>{
        const addressList = Object.values(addressMap)
        if (!addressList.length) return ''
        const defaultAddress = addressList.find(e=>e.isDefault)
        return !!defaultAddress ? defaultAddress.id : ''
    })
    const [addressID,setAddressID] = createSignal(defaultAddressID())

    const handleResponse = (e:IMemberShippingAddressUpdateResponse) => {
        const { deliveryMethodMap, selectedDeliveryID, total, addressID:_addressID } = e
        memberTotalToPay.set(total)
        setAddressID(_addressID)

        const radioInput = document.getElementById(`${p.idPrefix}-${_addressID}`) as HTMLInputElement
        if (!!radioInput) radioInput.checked = true

        if (p.idPrefix === 'shipping'){
            const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement
            const billingSameAsShipping = (checkoutForm.elements.namedItem('same-as-shipping') as HTMLInputElement).checked
            if (billingSameAsShipping){
                const address = addressMap[_addressID]
                if (!!address) memberSetBillingAddress(address)
            }
        } else {
            const address = addressMap[_addressID]
            if (!!address) memberSetBillingAddress(address)
        }

        dispatchInternalEvent(COUNTRY_CHANGED,{deliveryMethodMap,selectedDeliveryID})
    }

    const addressOnClick = (id:string) => async() => {
        if (p.idPrefix === 'billing') {
            const address = addressMap[id]
            if (address) memberSetBillingAddress(address)
        } else {
            const resp = await fetch(`/api/webshop/member-shipping-address-on-change/${id}`,{
                headers:httpRequestHeader(false,'client',true),
            })
            if (!resp.ok) {
                if (await sessionLost(resp.status)) return
                const radioInput = document.getElementById(`${p.idPrefix}-${addressID()}`) as HTMLInputElement
                if (!!radioInput) radioInput.checked = true
                return
            }
            
            const { apiResponse } = await resp.json() as {apiResponse:IMemberShippingAddressUpdateResponse}
            handleResponse(apiResponse)
        }
    }

    const onWsMessage = (e:CustomEvent) => handleResponse(e.detail as IMemberShippingAddressUpdateResponse)
    const onNewAddress = (e:CustomEvent) => {
        const newAddress = e.detail as IUserAddress
        setAddressMap(produce(c=>{
            if (newAddress.isDefault){
                const currentIDs = Object.keys(c)
                if (!!currentIDs.length) currentIDs.forEach(d=>{
                    c[d].isDefault = false
                })
            }
            c[newAddress.id] = newAddress
        }))

        if (newAddress.isCheckoutPage){
            const prefix = newAddress.isShipping ? 'shipping' : 'billing'
            const radioInput = document.getElementById(`${prefix}-${newAddress.id}`) as HTMLInputElement
            if (!!radioInput) radioInput.click()
        }
    }

    const onEditAddress = (e:CustomEvent) => {
        const { address, deliveryMethodMap, selectedDeliveryID, total } = e.detail as IMemberEditAddressUpdateResponse

        setAddressMap(produce(c=>{
            if (address.isDefault){
                const currentIDs = Object.keys(c)
                if (!!currentIDs.length) currentIDs.forEach(d=>{
                    c[d].isDefault = false
                })
            }
            c[address.id].firstName = address.firstName
            c[address.id].lastName = address.lastName
            c[address.id].line1 = address.line1
            c[address.id].line2 = address.line2
            c[address.id].city = address.city
            c[address.id].stateProvince = address.stateProvince
            c[address.id].postcode = address.postcode
            c[address.id].countryID = address.countryID
            c[address.id].countryName = address.countryName
            c[address.id].isDefault = address.isDefault
        }))

        if (p.idPrefix === 'shipping'){
            const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement
            const billingSameAsShipping = (checkoutForm.elements.namedItem('same-as-shipping') as HTMLInputElement).checked
            if (billingSameAsShipping){
                const shippingAddressID = (checkoutForm.elements.namedItem('shipping-address') as RadioNodeList).value
                if (shippingAddressID === address.id) memberSetBillingAddress(address)
            }
        }

        if (total !== undefined) memberTotalToPay.set(total)

        if (!!deliveryMethodMap && selectedDeliveryID !== undefined) dispatchInternalEvent(COUNTRY_CHANGED,{deliveryMethodMap,selectedDeliveryID})
    }

    const onDeleteAddress = (e:CustomEvent) => {
        const { deleteAddressID, newShippingAddressID, deliveryMethodMap, selectedDeliveryID, total } = e.detail as IMemberDeleteAddressUpdateResponse
        
        if (!!newShippingAddressID && p.idPrefix === 'shipping') {
            const radioInput = document.getElementById(`${p.idPrefix}-${newShippingAddressID}`) as HTMLInputElement
            if (!!radioInput) radioInput.checked = true
        }

        if (p.idPrefix === 'billing') {
            const selectedBillingAddressID = (document.querySelector(`input[name="${p.idPrefix}-address"]:checked`) as HTMLInputElement).value
            if (selectedBillingAddressID === deleteAddressID){
                const defaultAddress = addresses().find(e=>e.isDefault)
                const radioInput = document.getElementById(`${p.idPrefix}-${defaultAddress.id}`) as HTMLInputElement
                if (!!radioInput) radioInput.checked = true
            }
        }

        setAddressMap(produce(c=>c[deleteAddressID] = undefined))

        if (!!newShippingAddressID){
            if (!!deliveryMethodMap && selectedDeliveryID !== undefined) dispatchInternalEvent(COUNTRY_CHANGED,{deliveryMethodMap,selectedDeliveryID})
            if (total !== undefined) memberTotalToPay.set(total)
        } else {
            dispatchInternalEvent(COUNTRY_CHANGED,{deliveryMethodMap:{},selectedDeliveryID:0})
            memberTotalToPay.set(0)
        }
    }

    const onOnline = (e:CustomEvent) => {
        const { addressMap:_addressMap, selectedAddressID, deliveryMethodMap, selectedDeliveryID } = e.detail as IMemberAddressUpdateAfterDisconnectedResponse
        const newAddressIDs = Object.keys(_addressMap)
        const addressIdToDelete = Object.keys(addressMap).filter(c=>newAddressIDs.indexOf(c) === -1)

        setAddressMap(produce(c=>{
            if (!!addressIdToDelete.length){
                addressIdToDelete.forEach(d=>{
                    c[d] = undefined
                })
            }

            newAddressIDs.forEach(d=>{
                if (!!c[d]){
                    c[d].firstName = _addressMap[d].firstName
                    c[d].lastName = _addressMap[d].lastName
                    c[d].line1 = _addressMap[d].line1
                    c[d].line2 = _addressMap[d].line2
                    c[d].city = _addressMap[d].city
                    c[d].stateProvince = _addressMap[d].stateProvince
                    c[d].postcode = _addressMap[d].postcode
                    c[d].countryID = _addressMap[d].countryID
                    c[d].countryName = _addressMap[d].countryName
                    c[d].isDefault = _addressMap[d].isDefault
                } else c[d] = _addressMap[d]
            })
        }))

        if (p.idPrefix === 'shipping'){
            const radioInput = document.getElementById(`${p.idPrefix}-${selectedAddressID}`) as HTMLInputElement
            if (!!radioInput) radioInput.click()
        }
        dispatchInternalEvent(COUNTRY_CHANGED,{deliveryMethodMap,selectedDeliveryID})
    }

    const editBtnOnClick = (id:string) => () => {
        const address = addressMap[id]
        if (!!address) dispatchInternalEvent(OPEN_EDIT_ADDRESS_MODAL,address)
    }

    const billingSameAsShippingOnClick = (e:MouseEvent) => {
        const billingSameAsShipping = (e.target as HTMLInputElement).checked
        const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement
        if (billingSameAsShipping && p.idPrefix === 'shipping'){
            const shippingAddressID = (checkoutForm.elements.namedItem('shipping-address') as RadioNodeList).value
            const address = addressMap[shippingAddressID]
            if (!!address) memberSetBillingAddress(address)
        } else if (!billingSameAsShipping && p.idPrefix === 'billing'){
            const billingAddressID = (checkoutForm.elements.namedItem('billing-address') as RadioNodeList).value
            const address = addressMap[billingAddressID]
            if (!!address) memberSetBillingAddress(address)
        }
    }

    createEffect(()=>{
        if (!!p.noServiceCountryMap) userAlreadyHasAddress.set(!!Object.values(addressMap).filter(e=>!p.noServiceCountryMap[e.countryID]).length)
    })

    onMount(()=>{
        const isCheckoutPage = window.location.pathname === '/checkout'

        if (p.idPrefix === 'shipping' && isCheckoutPage) document.addEventListener(MEMBER_SHIPPING_ADDRESS_UPDATE,onWsMessage,true);
        else{
            const address = addressMap[defaultAddressID()]
            if (!!address) memberSetBillingAddress(address)
        }

        const billingSameAsShippingCheckbox = document.getElementById('billing-same-as-shipping')
        billingSameAsShippingCheckbox.addEventListener('click',billingSameAsShippingOnClick,true)
        

        document.addEventListener(MEMBER_NEW_ADDRESS_UPDATE,onNewAddress,true)
        document.addEventListener(MEMBER_EDIT_ADDRESS_UPDATE,onEditAddress,true)
        document.addEventListener(MEMBER_DELETE_ADDRESS_UPDATE,onDeleteAddress,true)
        document.addEventListener(BACK_ONLINE_ADDRESS_LIST,onOnline,true)

        onCleanup(()=>{
            if (p.idPrefix === 'shipping' && isCheckoutPage) document.removeEventListener(MEMBER_SHIPPING_ADDRESS_UPDATE,onWsMessage,true);
            document.removeEventListener(MEMBER_NEW_ADDRESS_UPDATE,onNewAddress,true)
            document.removeEventListener(MEMBER_EDIT_ADDRESS_UPDATE,onEditAddress,true)
            document.removeEventListener(MEMBER_DELETE_ADDRESS_UPDATE,onDeleteAddress,true)
            document.removeEventListener(BACK_ONLINE_ADDRESS_LIST,onOnline,true)
            billingSameAsShippingCheckbox.removeEventListener('click',billingSameAsShippingOnClick,true)
        })
    })

    return (
        <div ref={containerRef} id={`checkout-member-address-list-${p.idPrefix}`}>
            <For 
                each={addresses()} 
                children={e=>(
                    <Address 
                        address={e} 
                        checked={e.id === (p.idPrefix === 'shipping' ? (!!p.noServiceCountryMap && !!p.noServiceCountryMap[e.countryID] ? '' : p.selectedAddressID) : defaultAddressID())} 
                        idPrefix={p.idPrefix} 
                        onClick={addressOnClick(e.id)}
                        editBtnOnClick={editBtnOnClick(e.id)}
                        required={p.required}
                        disabled={!!p.noServiceCountryMap && !!p.noServiceCountryMap[e.countryID]}
                    />
                )} 
            />
        </div>
    )
}

export default AddressList