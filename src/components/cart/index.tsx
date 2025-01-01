import { useStore } from '@nanostores/solid';
import CartItem from './cart-item';
import { For, createSignal, createMemo, onMount, onCleanup, Show } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import type { IAddToBagResponse, ICartContent, ICartItemMap } from './interfaces';
import { 
    dispatchInternalEvent,
    formatPrice, 
    httpRequestHeader, 
    sessionLost, 
    showErrorModal, 
    submitBtnClass, 
    type ICatalogueMap, 
} from '@misc';
import { signedIn, cartSubtotal, memberTotalToPay, cartHasItems, thisClientPaymentInProcess, otherClientPaymentInProcess, selectedCollectionPoint, shopNameMap, acceptMembership } from '@stores';
import SignInBtn from './empty-cart/sign-in-btn';
import ContinueShopping from './empty-cart/continue-shopping';
import DeleteItemModal from './delete-item-modal';
import type { IProduct } from '@components/catalogue-item/interfaces';
import { 
    ADD_TO_BAG_FROM_CATALOGUE, 
    CART_ITEM_QTY_BACK_TO_ORIGINAL, 
    CART_QTY_UPDATE, 
    CART_UPDATE,
    PRODUCT_UPDATE,
    UPDATE_CART_ITEM_MAP, 
} from '@misc/event-keys';
import { CartContext } from './context';
import DiscountRow from './discount-row';

type ICartApiResponse = {success?:boolean} & IAddToBagResponse

const CartList = (
    {
        itemsMap,
        productDetailsMap,
        cartCalculation,
        isCheckoutPage,
    }:{
        itemsMap:ICartItemMap;
        productDetailsMap:ICatalogueMap;
        cartCalculation:ICartContent;
        isCheckoutPage?:boolean;
    }
) => {
    let 
        ref, 
        checkoutBtnRef, 
        cartContentRef, 
        resizeTimeout, 
        emptyBagRef, 
        cartLockedRef,
        checkoutAccordionCheckboxRef,
        checkoutAccordionChevronRef,
        checkoutAccordionLabelRef,
        nonCheckoutResizeObserver:ResizeObserver,
        sidebar

    const $signedIn = useStore(signedIn)
    const $acceptMembership = useStore(acceptMembership)
    const [cartItemMap, setCartItemMap] = createStore(itemsMap)
    const [cartContent, setCartContent] = createStore(cartCalculation)
    const [prodDetailsMap, setProdDetailsMap] = createStore(productDetailsMap)
    const cartItemIDs = createMemo(()=>!!Object.entries(cartItemMap).length ? Object.values(cartItemMap).sort((a,b)=>b.dateAdded - a.dateAdded).filter(e=>!!e.quantity).map(e=>e.id) : [])
    const subtotalBeforeDiscounts = createMemo(()=>isCheckoutPage ? Object.values(cartItemMap).map(({finalPrice,quantity})=>finalPrice * quantity).reduce((a,b)=>a+b,0) : 0)
    const itemCount = createMemo(()=>!!Object.values(cartItemMap).length ? Object.values(cartItemMap).map(e=>e.quantity).reduce((a,b)=>a+b,0) : 0)
    const [deleteID, setDeleteID] = createSignal('')
    const $otherClientPaymentInProcess = useStore(otherClientPaymentInProcess)

    const getMaxStockQty = (productID:string) => {
        const product = prodDetailsMap[productID]
        if (!product) return 0
        return Math.max(...product.stockQuantities.map(e=>e.quantity))
    }

    const getCurrentLocationStockQty = (productID:string) => {
        const product = prodDetailsMap[productID]
        if (!product) return 0
        const currentCollectionPoint = selectedCollectionPoint.get()
        return product.stockQuantities.find(e=>e.address === currentCollectionPoint)?.quantity || 0
    }

    const setLoading = (id:string,loading:boolean) => {
        const spinner = document.getElementById(`cart-item-${id}-loading-spinner`) as HTMLDivElement
        if (!!spinner) spinner.classList.toggle('hidden',!loading)
    }

    const apiRequest = async (id:string,changeInQuantity:number,dateAdded:number) => {
        setLoading(id,true)
        const resp = await fetch(`/api/webshop/product-add-qty`,{
            method:"POST",
            headers:httpRequestHeader(false,'client',true),
            body:JSON.stringify({id,changeInQuantity,dateAdded})
        })

        if (!resp.ok) {
            if (await sessionLost(resp.status)) return
            const inputField = document.getElementById(`cart-item-${id}`) as HTMLInputElement
            if (!!inputField) inputField.value = `${cartItemMap[id].quantity}`
            setLoading(id,false)
            showErrorModal('Failed to update your shopping bag. Please try again later.')
            return
        }
        const json = await resp.json()
        const { apiResponse: { cartContent: _cartContent, cartItemMap: _cartItemMap, total, productDetails } } = json as {apiResponse:IAddToBagResponse}
        updateCartItemMap({cartContent: _cartContent, cartItemMap: _cartItemMap, total, productDetails})
        dispatchInternalEvent(CART_QTY_UPDATE,{id,qtyInCart:cartItemMap[id]?.quantity || 0})
        setLoading(id,false)
    }
    
    const onMinus = (id:string) => async () => {
        if (cartItemMap[id].quantity === 1) setDeleteID(id)
        else apiRequest(id,-1,cartItemMap[id].dateAdded)
    }
    const onPlus = (id:string) => async () => {
        const currentCollectionPoint = selectedCollectionPoint.get()
        const maxStockQty = getMaxStockQty(id)
        const currentLocationStockQty = !!currentCollectionPoint ? getCurrentLocationStockQty(id) : maxStockQty
        if (cartItemMap[id].quantity < currentLocationStockQty) apiRequest(id,1,cartItemMap[id].dateAdded)
        else if (cartItemMap[id].quantity < maxStockQty) {
            const collectionPontOnQtyIncreaseCheckbox = document.getElementById("collection-point-on-qty-increase") as HTMLInputElement
            const collectionPointNameElem = document.getElementById('current-collection-point-name') as HTMLSpanElement
            if (!collectionPontOnQtyIncreaseCheckbox || !collectionPointNameElem) return
            collectionPointNameElem.innerText = currentCollectionPoint === 1 ? 'our warehouse' : `${shopNameMap.get()[currentCollectionPoint]} store`
            collectionPontOnQtyIncreaseCheckbox.dataset.changeInQuantity = '1'
            collectionPontOnQtyIncreaseCheckbox.dataset.productId = id
            collectionPontOnQtyIncreaseCheckbox.dataset.dt = `${cartItemMap[id].dateAdded}`
            collectionPontOnQtyIncreaseCheckbox.checked = true
        }
    }

    const onInputChange = (id:string) => async (newQty:number) => {
        if (newQty === cartItemMap[id].quantity) return
        else if (newQty <= 0) apiRequest(id,cartItemMap[id].quantity * -1,cartItemMap[id].dateAdded)
        else {
            const currentCollectionPoint = selectedCollectionPoint.get()
            const maxStockQty = getMaxStockQty(id)
            const currentLocationStockQty = !!currentCollectionPoint ? getCurrentLocationStockQty(id) : maxStockQty
            const changeInQuantity = newQty-cartItemMap[id].quantity
            if (newQty <= currentLocationStockQty) apiRequest(id,changeInQuantity,cartItemMap[id].dateAdded)
            else if (newQty <= maxStockQty){
                const collectionPontOnQtyIncreaseCheckbox = document.getElementById("collection-point-on-qty-increase") as HTMLInputElement
                const collectionPointNameElem = document.getElementById('current-collection-point-name') as HTMLSpanElement
                if (!collectionPontOnQtyIncreaseCheckbox || !collectionPointNameElem) return
                collectionPointNameElem.innerText = currentCollectionPoint === 1 ? 'our warehouse' : `${shopNameMap.get()[currentCollectionPoint]} store`
                collectionPontOnQtyIncreaseCheckbox.dataset.changeInQuantity = `${changeInQuantity}`
                collectionPontOnQtyIncreaseCheckbox.dataset.productId = id
                collectionPontOnQtyIncreaseCheckbox.dataset.dt = `${cartItemMap[id].dateAdded}`
                collectionPontOnQtyIncreaseCheckbox.checked = true
            } else apiRequest(id,currentLocationStockQty - cartItemMap[id].quantity,cartItemMap[id].dateAdded)
        }
    }

    const deleteOnClick = (id:string) => () => setDeleteID(id)

    const addToBagFromCatalogue = (e:CustomEvent) => {
        updateCartItemMap(e.detail as IAddToBagResponse);
        const cartSidebarCheckbox = document.getElementById('shopping-bag-sidebar-checkbox') as HTMLInputElement
        if (!!cartSidebarCheckbox) cartSidebarCheckbox.dispatchEvent(new CustomEvent('show'))
    }

    const checkoutResize = () => {
        const isWideScreen = window.innerWidth >= 1024
        checkoutAccordionCheckboxRef.checked = isWideScreen
        checkoutAccordionCheckboxRef.disabled = isWideScreen
        checkoutAccordionLabelRef.classList.toggle('cursor-pointer',!isWideScreen)
        checkoutAccordionChevronRef.classList.toggle('hidden',isWideScreen)
    }

    const checkoutOnResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkoutResize, 200);
    }

    const nonCheckoutResizeCallback = (entries:ResizeObserverEntry[]) => entries.forEach(entry=>{
        const sidebarHeight = entry.contentRect.height
        const sidebarHeader = entry.target.getElementsByClassName('sidebar-header')[0] as HTMLDivElement
        const sidebarHeaderHeight = sidebarHeader.getBoundingClientRect().height
        const checkoutBtnHeight = checkoutBtnRef.getBoundingClientRect().height
        cartContentRef.style.height = `${ sidebarHeight - checkoutBtnHeight - sidebarHeaderHeight }px`
        cartContentRef.style.marginTop = `${ sidebarHeaderHeight }px`
        emptyBagRef.style.height = `${ sidebarHeight }px`
        cartLockedRef.style.height = `${ sidebarHeight }px`
    })

    const cancelDelete = () => setDeleteID('')

    const deleteItem = async () => {
        await apiRequest(deleteID(),cartItemMap[deleteID()].quantity * -1,cartItemMap[deleteID()].dateAdded)
        setDeleteID('')
    }

    const updateCartItemMap = (e:ICartApiResponse) => {
        const { cartContent: _cartContent, cartItemMap: _cartItemMap, total, productDetails } = e

        cartSubtotal.set(_cartContent.subtotalBeforeDelivery)

        setProdDetailsMap(produce(c=>{
            productDetails.forEach(d=>{
                if (!!c[d.id]){
                    c[d.id].createdAt = d.createdAt
                    c[d.id].description = d.description
                    c[d.id].discountedPrice = d.discountedPrice
                    c[d.id].images = d.images
                    c[d.id].name = d.name
                    c[d.id].price = d.price
                    c[d.id].stockQuantities = [...d.stockQuantities]
                    c[d.id].totalSales = d.totalSales
                    c[d.id].url = d.url
                } else c[d.id] = d
            })
        }))
        
        if (!isCheckoutPage) setCartContent(produce(c=>{
            Object.entries(_cartContent).forEach(([k,v])=>{
                if (k === 'campaignDiscounts' || k === 'voucherDiscounts') c[k] = !!v ? [...v] : []
                else c[k] = v
            });
        }));

        setCartItemMap(produce(c=>{
            const newMapIDs = Object.keys(_cartItemMap)
            const idsNotInNewMap = Object.keys(c).filter(e=>newMapIDs.indexOf(e) === -1)
            
            if (idsNotInNewMap.length !== 0) idsNotInNewMap.forEach(e=>{
                c[e] = undefined
            })

            newMapIDs.forEach(d=>{
                if (!c[d]) c[d] = _cartItemMap[d]
                else {
                    c[d].quantity = _cartItemMap[d].quantity
                    c[d].dateAdded = _cartItemMap[d].dateAdded
                    c[d].finalPrice = _cartItemMap[d].finalPrice
                }
            })
        }));

        cartHasItems.set(!!itemCount())

        if (isCheckoutPage && signedIn) memberTotalToPay.set(total)
    }

    const wsUpdateCart = (event:CustomEvent) => {
        const e = event.detail as ICartApiResponse

        if (thisClientPaymentInProcess.get()) return

        const collectionPointOnQtyIncreaseCheckbox = document.getElementById("collection-point-on-qty-increase") as HTMLInputElement
        const productIDonChange = collectionPointOnQtyIncreaseCheckbox.dataset.productId
        if (!!productIDonChange){
            const { cartItemMap: _cartItemMap } = e
            const newQty = _cartItemMap[productIDonChange]?.quantity || 0
            const currentQty = cartItemMap[productIDonChange].quantity || 0
            if (newQty !== currentQty) collectionPointOnQtyIncreaseCheckbox.checked = false
        }
        
        updateCartItemMap(e)
    }

    const updateCartProduct = (ev:CustomEvent) => {
        const e = ev.detail as IProduct[]

        setCartItemMap(produce(c=>{
            e.forEach(d=>{
                if (!!c[d.id]) c[d.id].quantity = Math.min(Math.max(...d.stockQuantities.map(f=>f.quantity)), c[d.id].quantity)
            })
        }))

        setProdDetailsMap(produce(c=>{
            e.forEach(d=>{
                if (!!c[d.id]){
                    c[d.id].createdAt = d.createdAt
                    c[d.id].description = d.description
                    c[d.id].discountedPrice = d.discountedPrice
                    c[d.id].images = d.images
                    c[d.id].name = d.name
                    c[d.id].price = d.price
                    c[d.id].stockQuantities = [...d.stockQuantities]
                    c[d.id].totalSales = d.totalSales
                    c[d.id].url = d.url
                } else c[d.id] = d
            })
        }))
    }

    const cartItemQtyBackToOriginal = (e:CustomEvent) => {
        const productID = e.detail as string
        const cartItem = cartItemMap[productID]
        if (!cartItem) return
        const cartItemElem = document.getElementById(`cart-item-${productID}`) as HTMLInputElement
        if (!!cartItemElem) cartItemElem.value = `${cartItem.quantity}`
    }

    const onUpdateCartItemMap = (ev:CustomEvent) => {
        const e = ev.detail as ICartApiResponse
        updateCartItemMap(e)
    }

    const sidebarCheckboxOnChange = (e:Event) => {
        const checked = (e.target as HTMLInputElement).checked
        if (checked) nonCheckoutResizeObserver.observe(sidebar)
        else nonCheckoutResizeObserver.disconnect()
    }

    onMount(()=>{
        sidebar = document.getElementById('shopping-bag-sidebar') as HTMLDivElement
        if (!!sidebar) {
            nonCheckoutResizeObserver = new ResizeObserver(nonCheckoutResizeCallback)
            nonCheckoutResizeObserver.observe(sidebar)
        }
        document.addEventListener(ADD_TO_BAG_FROM_CATALOGUE, addToBagFromCatalogue, true);
        document.addEventListener(UPDATE_CART_ITEM_MAP, onUpdateCartItemMap, true);
        document.addEventListener(CART_UPDATE,wsUpdateCart, true)
        document.addEventListener(PRODUCT_UPDATE, updateCartProduct, true);
        document.addEventListener(CART_ITEM_QTY_BACK_TO_ORIGINAL,cartItemQtyBackToOriginal, true)

        const shoppingBagCheckbox = document.getElementById('shopping-bag-sidebar-checkbox') as HTMLInputElement;

        if (isCheckoutPage) {
            checkoutResize()
            window.addEventListener('resize', checkoutOnResize, true);
        } else if (!!shoppingBagCheckbox) shoppingBagCheckbox.addEventListener('change',sidebarCheckboxOnChange,true)

        cartSubtotal.set(cartCalculation.subtotalBeforeDelivery)
        
        onCleanup(()=>{
            document.removeEventListener(ADD_TO_BAG_FROM_CATALOGUE, addToBagFromCatalogue,true);
            document.removeEventListener(UPDATE_CART_ITEM_MAP, onUpdateCartItemMap,true);
            document.removeEventListener(CART_UPDATE,wsUpdateCart,true)
            document.removeEventListener(PRODUCT_UPDATE, updateCartProduct,true);
            document.removeEventListener(CART_ITEM_QTY_BACK_TO_ORIGINAL,cartItemQtyBackToOriginal,true)
            if (!isCheckoutPage && !!shoppingBagCheckbox) shoppingBagCheckbox.removeEventListener('change',sidebarCheckboxOnChange,true)
            if (isCheckoutPage) window.removeEventListener('resize', checkoutOnResize,true);
        })
    })
    
    return (
        <div id='cart' ref={ref}>
            <div class={`${!cartItemIDs().length || (!isCheckoutPage && $otherClientPaymentInProcess()) ? 'hidden' : ''}`} id='cart-content'>
                <div ref={cartContentRef} class={`overflow-y-scroll hide-scrollbar divide-y ${!isCheckoutPage ? 'border-t border-gray-200' : ''}`.trim()}>
                    {isCheckoutPage && 
                        <>
                        <input ref={checkoutAccordionCheckboxRef} id='checkout-review-items' type='checkbox' class='peer' hidden />
                        <label ref={checkoutAccordionLabelRef} for='checkout-review-items' class='cursor-pointer w-full flex justify-between peer-checked:[&>svg]:rotate-180'>
                            <div class='uppercase text-xs xs:tracking-[0.1rem] xl:tracking-widest xs:text-sm py-3'>
                                1. Review Your order ({itemCount()} item{itemCount() > 1 ? 's' : ''})
                            </div>
                            <svg ref={checkoutAccordionChevronRef} viewBox='0 0 100 100' height='0.8em' fill='none' stroke='black' stroke-width='0.4rem' class='my-auto duration-300'>
                                <polyline points='5,30 50,70 95,30' />
                            </svg>
                        </label>
                        </>
                    }
                    <div class={isCheckoutPage ? 'relative peer-checked:max-h-fit max-h-0 overflow-y-hidden transition-all duration-300' : ''}>
                        <CartContext.Provider 
                            value={{cartItemMap,prodDetailsMap}} 
                            children={
                                <For 
                                    each={cartItemIDs()} 
                                    children={(id) => (
                                        <CartItem 
                                            id={id} 
                                            onMinus={onMinus(id)}
                                            onPlus={onPlus(id)}
                                            onInputChange={onInputChange(id)}
                                            deleteOnClick={deleteOnClick(id)}
                                        />
                                    )} 
                                />
                            }
                        />
                    </div>
                    <div class='table w-full p-2 text-sm font-light'>
                        <div class='table-row-group'>
                            {!isCheckoutPage && <>
                                <For 
                                    each={cartContent.campaignDiscounts}
                                    children={e=><DiscountRow text={e.name} discountAmount={formatPrice(e.amount * -1)} />}
                                />
                                <For 
                                    each={cartContent.voucherDiscounts}
                                    children={e=><DiscountRow text={`Discount - ${e.code}`} discountAmount={formatPrice(e.amount * -1)} />}
                                />
                            </>
                            }
                            {!isCheckoutPage && !!cartContent.memberDiscount && <DiscountRow text={`Member discount: ${cartContent.memberDiscountRate}% off`} discountAmount={formatPrice(cartContent.memberDiscount * -1)} />}
                            {!isCheckoutPage && !!cartContent.staffDiscount && <DiscountRow text='Staff discount' discountAmount={formatPrice(cartContent.staffDiscount * -1)} />}
                            <div class='table-row font-semibold text-lg'>
                                <div class='table-cell'>Subtotal</div>
                                <div class='table-cell text-right'>{formatPrice(isCheckoutPage ? subtotalBeforeDiscounts() : cartContent.subtotalBeforeDelivery)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div ref={checkoutBtnRef} class={`${isCheckoutPage ? 'hidden' : ''} absolute p-4 bottom-0 left-0 right-0 flex bg-white shadow-[0_12px_8px_10px_rgba(0,0,0,0.3)]`}>
                    <a href="/checkout" class={`${submitBtnClass.replace('mt-6', '')} text-center`}>Checkout</a>
                </div>
            </div>
            <div ref={emptyBagRef} class={`${!!cartItemIDs().length || isCheckoutPage || $otherClientPaymentInProcess() ? 'hidden' : 'flex'} flex-col justify-center px-4 space-y-4`}>
                <h3 class={`font-semibold text-lg tracking-wider [word-spacing:0.2rem] ${(!$acceptMembership() || $signedIn()) ? 'text-center' : ''}`}>Your shopping bag is empty!</h3>
                <Show when={$acceptMembership() && !$signedIn()} fallback={<ContinueShopping />} children={<SignInBtn />} />
            </div>
            <div ref={cartLockedRef} class={`${!isCheckoutPage && $otherClientPaymentInProcess() ? 'flex' : 'hidden'} flex-col justify-center`}>
                <p class="text-center font-light italic text-sm sm:text-base">Cart locked during checkout process</p>
            </div>
            <Show 
                when={!!deleteID() && !!prodDetailsMap[deleteID()]} 
                children={
                    <DeleteItemModal 
                        name={prodDetailsMap[deleteID()]?.name || ''} 
                        deleteItem={deleteItem} 
                        cancel={cancelDelete} 
                    />
                } 
            />
        </div>
    )
}

export default CartList