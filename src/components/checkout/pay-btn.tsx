import { createEffect, Show } from 'solid-js'
import { guestTotalToPay, memberTotalToPay, signedIn, canShowPayBtn, cardFieldComplete, cartHasItems, selectedCollectionPoint, deliveryAvailable, turnstilePassed } from "@stores"
import { useStore } from '@nanostores/solid'
import { formatPrice } from '@misc'

const buttonClass = "w-full mt-4 py-2 uppercase font-serif tracking-[0.25rem] [word-spacing:0.2em] cursor-pointer disabled:cursor-not-allowed text-white bg-gray-600 border border-gray-600 mouse:hover:enabled:bg-black mouse:hover:enabled:border-black duration-300 font-semibold"

const GuestPayBtn = () => {
    const guestTotal = useStore(guestTotalToPay)
    const $cardFieldComplete = useStore(cardFieldComplete)

    return (
        <input 
            type='submit' 
            id='checkout-submit' 
            value={`Pay ${formatPrice(guestTotal())}`} 
            class={buttonClass}
            disabled={!$cardFieldComplete()}
        />
    )
}

const MemberPayBtn = () => {
    const memberTotal = useStore(memberTotalToPay)
    const $cardFieldComplete = useStore(cardFieldComplete)

    return (
        <input 
            type='submit' 
            id='checkout-submit' 
            value={`Pay ${formatPrice(memberTotal())}`} 
            class={buttonClass}
            disabled={!$cardFieldComplete()}
        />
    )
}

const Button = () => {
    const $signedIn = useStore(signedIn)
    return (
        <Show 
            when={$signedIn()}
            children={<MemberPayBtn />}
            fallback={<GuestPayBtn />}
        />
    )
}

const PayButton = () => {
    const $canShowPayBtn = useStore(canShowPayBtn)
    const $cartHasItems = useStore(cartHasItems)
    const $selectedCollectionPoint = useStore(selectedCollectionPoint)
    const $deliveryAvailable = useStore(deliveryAvailable)
    const $turnstilePassed = useStore(turnstilePassed)
    createEffect(() => {
        console.log('cartHasItems: ', $cartHasItems(), ', selectedCollectionPoint: ', $selectedCollectionPoint(), ', deliveryAvailable: ', $deliveryAvailable(), ', turnstilePassed: ', $turnstilePassed())
    })
    return (
        <Show
            when={$canShowPayBtn()} 
            children={<Button />} 
        />
    )
}

export default PayButton