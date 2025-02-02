import type { Address } from '@revolut/checkout/types/types'
import { atom, computed, map } from 'nanostores'
import { PUBLIC_FM_ACCEPT_MEMBERSHIP } from 'astro:env/client'

export const acceptMembership = atom(PUBLIC_FM_ACCEPT_MEMBERSHIP === 'true')
export const signedIn = atom(false)
export const cartSubtotal = atom(0)
export const memberTotalToPay = atom(0)
export const userAlreadyHasAddress = atom(false)
export const cartHasItems = atom(false)
export const guestDeliveryCost = atom(0)
export const memberDeliveryCost = atom(0)
export const guestTotalToPay = computed([cartSubtotal,guestDeliveryCost],(_cartSubtotal,_guestDeliveryCost)=>_cartSubtotal + _guestDeliveryCost)
export const deliveryAvailable = atom(false)
export const memberBillingAddress = map<Address>({
    streetLine1: "",
    streetLine2: "",
    city: "",
    region: "",
    postcode: "",
    countryCode: "GB"
})
export const memberFullName = atom('')
export const memberEmail = atom('')
export const checkoutGuestSignUp = atom(false)
export const thisClientPaymentInProcess = atom(false)
export const otherClientPaymentInProcess = atom(false)
export const checkoutOrderID = atom(0)
export const selectedCollectionPoint = atom(0) // 0 = nothing selected, 1 = home delivery, 2+ = click and collect
export const shopNameMap = map<{[k:number]:string}>()
export const preferredCollectionPoint = atom(0)
export const pageToken = atom('')
export const homeDeliveryBillingSameAsShipping = atom(true)
export const cardFieldComplete = atom(false)
export const turnstilePassed = atom(false)
export const canShowPayBtn = computed(
    [
        cartHasItems,
        selectedCollectionPoint,
        deliveryAvailable,
        signedIn,
        userAlreadyHasAddress,
        turnstilePassed,
    ],(
        _cartHasItems,
        _selectedCollectionPoint,
        _deliveryAvailable,
        _signedIn,
        _userAlreadyHasAddress,
        _turnstilePassed,
    )=>_turnstilePassed
        && _cartHasItems 
        && (_selectedCollectionPoint > 1 || (_selectedCollectionPoint === 1 && _deliveryAvailable))
        && (_signedIn ? _userAlreadyHasAddress : true)
)
export const cartID = atom('')
export const headerScrollLimit = atom(10)