import { useStore } from "@nanostores/solid";
import { createContext, Show, useContext, onMount, createSignal } from 'solid-js'
import { cartHasItems, cartSubtotal } from "@stores";

interface IContext {
    freeShippingLimit:number;
}

const Context = createContext<IContext>()

const ProgressBar = () => {
    const $cartSubtotal = useStore(cartSubtotal)
    const { freeShippingLimit } = useContext(Context)

    return (
        <>
        <p class='uppercase text-xs tracking-widest'><span class='hidden xs:inline'>You are</span> just £{(freeShippingLimit - $cartSubtotal()) * 0.01} from free shipping!</p>
        <progress max={freeShippingLimit} value={$cartSubtotal()} class='w-full h-1 mt-1' id='free-shipping-progress' />
        </>
    )
}

const LimitReached = () => (
    <p class='uppercase text-xs tracking-widest font-semibold'>You have unlocked free shipping!</p>
)

const CartHasItemsElem = () => {
    const $cartSubtotal = useStore(cartSubtotal)
    const { freeShippingLimit } = useContext(Context)
    const [isDesktop,setIsDesktop] = createSignal(false)

    onMount(()=>{
        setIsDesktop(window.matchMedia && matchMedia("(pointer:fine)").matches)
    })

    return (
        <div class={`flex flex-col justify-center h-14 ${isDesktop() ? 'px-3' : 'pl-3'}`}>
            <Show
                when={$cartSubtotal() < freeShippingLimit}
                children={<ProgressBar />}
                fallback={<LimitReached />}
            />
        </div>
    )
}

const FreeShippingProgress = (
    p:{
        freeShippingLimit:number;
    }
) => {
    const $cartHasItems = useStore(cartHasItems)
    const $cartSubtotal = useStore(cartSubtotal)
    return (
        <Context.Provider
            value={{freeShippingLimit:p.freeShippingLimit}}
            children={
                <Show
                    when={$cartHasItems() && !!$cartSubtotal()}
                    children={<CartHasItemsElem {...p} />}
                />
            }
        />
    )
}

export default FreeShippingProgress