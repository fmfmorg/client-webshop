import { zaraz }  from 'zaraz-ts'
import type { IAddToBagResponse, ICartItem } from '@components/cart/interfaces';
import ShoppingBag from '@components/layout/header/icons/shopping-bag';
import LoadingSmall from '@components/layout/header/icons/loading-small';
import { Show, createMemo, createSignal, useContext, onMount, onCleanup } from 'solid-js'
import { useStore } from '@nanostores/solid';
import { cartID, otherClientPaymentInProcess, selectedCollectionPoint, shopNameMap } from '@stores';
import { dispatchInternalEvent, httpRequestHeader, sessionLost, showErrorModal } from '@misc';
import { ADD_TO_BAG_FROM_CATALOGUE } from '@misc/event-keys';
import Product from './product';
import CatalogueItemContext from './context';

const CatalogueItem = (
    p:{
        id:string;
        productPageRelatedProduct?:boolean;
        index:number,
        homepageBestseller?:boolean;
        isProductPage:boolean;
        updateCartQty:(item:ICartItem) => void;
    }
) => {
    let linkRef, containerRef

    const { productMap, cartItemMap, productIdOrderMap, observerCallback } = useContext(CatalogueItemContext)

    const [loading,setLoading] = createSignal(false)

    const $cartID = useStore(cartID)
    const $shopNameMap = useStore(shopNameMap)
    const $otherClientPaymentInProcess = useStore(otherClientPaymentInProcess)
    const currentCollectionPoint = useStore(selectedCollectionPoint)
    const qtyInCart = createMemo(()=>cartItemMap[p.id]?.quantity || 0)
    const maxStockQty = createMemo(()=>Math.max(...productMap[p.id].stockQuantities.map(e=>e.quantity)))
    const qtyAvailable = createMemo(()=>!!currentCollectionPoint() ? (productMap[p.id].stockQuantities.find(e=>e.address === currentCollectionPoint())?.quantity || 0) : maxStockQty())
    const url = createMemo(()=>productMap[p.id].url)
    const mainType = createMemo(()=>productMap[p.id].mainType)
    const group = createMemo(()=>productIdOrderMap[p.id]?.group || 0)
    const observe = createMemo(()=>!!productIdOrderMap[p.id]?.observe)
    const showBuyBtn = createMemo(()=>!$otherClientPaymentInProcess() && maxStockQty() > qtyInCart())

    const addToBag = async (e:Event) => {
        e.preventDefault()
        if (qtyInCart() < qtyAvailable()){
            setLoading(true)

            const resp = await fetch(`/api/webshop/product-add-qty`,{
                method:"POST",
                headers:httpRequestHeader(false,'client',true),
                body:JSON.stringify({id:p.id,changeInQuantity:1,dateAdded:Date.now()})
            })

            if (!resp.ok) {
                if (await sessionLost(resp.status)) return
                setLoading(false)
                showErrorModal('Failed to update your shopping bag. Please try again later.')
                return
            }

            const json = await resp.json()
            const { apiResponse } = json as {apiResponse:IAddToBagResponse}
            const { cartItemMap } = apiResponse

            dispatchInternalEvent(ADD_TO_BAG_FROM_CATALOGUE,apiResponse)
            setLoading(false)
            p.updateCartQty(cartItemMap[p.id])

            // facebook pixel
            await zaraz.track('AddToCart',{
                content_ids: [p.id],
                content_type: 'product',
            })

            // pinterest conversion api
            await zaraz.track('addtocart',{
                event_id: $cartID(),
                line_items: [
                    {
                        product_id: p.id,
                    }
                ]
            })
        } else if (!!currentCollectionPoint()){
            const collectionPontOnQtyIncreaseCheckbox = document.getElementById("collection-point-on-qty-increase") as HTMLInputElement
            const collectionPointNameElem = document.getElementById('current-collection-point-name') as HTMLSpanElement
            if (!collectionPontOnQtyIncreaseCheckbox || !collectionPointNameElem) return
            collectionPointNameElem.innerText = currentCollectionPoint() === 1 ? 'our warehouse' : `${$shopNameMap()[currentCollectionPoint()]} store`
            collectionPontOnQtyIncreaseCheckbox.dataset.changeInQuantity = '1'
            collectionPontOnQtyIncreaseCheckbox.dataset.productId = p.id
            collectionPontOnQtyIncreaseCheckbox.dataset.dt = `${Date.now()}`
            collectionPontOnQtyIncreaseCheckbox.checked = true
        }
    }

    onMount(()=>{
        const observer = new IntersectionObserver(observerCallback,{rootMargin:'200px'})
        if (observe()) observer.observe(containerRef)
        onCleanup(()=>{
            if (observe()) observer.disconnect()
        })
    })

    return (
        <div ref={containerRef} class={`relative${!!p.productPageRelatedProduct ? ' related-product' : ''}${!!p.homepageBestseller ? ' homepage-bestseller' : ''}`.trim()}>
            <Show 
                when={!group()}
                children={
                    <>
                    <a ref={linkRef} href={`/${mainType()}/${url()}/${p.id}`}>
                        <Product {...{
                            ...p,
                            addToBag,
                            renderImages:true,
                            loading:loading(),
                            isProductPage:p.isProductPage,
                            showBuyBtn:showBuyBtn()
                        }} />
                    </a>
                    <Show 
                        when={showBuyBtn()}
                        children={
                            <div class="absolute top-0 right-0 p-1 mouse:hidden">
                                <button class="add-to-bag add-to-bag-touchscreen" type="button" aria-label="Add to Bag" onClick={addToBag}>
                                    <Show 
                                        when={loading()}
                                        children={<LoadingSmall className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 stroke-[0.2rem] fill-gray-500 animate-spin" />}
                                        fallback={<ShoppingBag className="shopping-bag-icon h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 fill-none stroke-[0.2rem]" />}
                                    />
                                </button>
                            </div>
                        }
                    />
                    </>
                }
            />
        </div>
    )
}

export default CatalogueItem