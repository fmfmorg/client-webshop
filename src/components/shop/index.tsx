import { For, onMount, onCleanup, createMemo, Show, createSignal, createEffect } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import CatalogueItemContext from '@components/catalogue-item/context'
import type { IAddToBagResponse, ICartItem, ICartItemMap } from "@components/cart/interfaces";
import { catalogueItemsOnResize, dispatchInternalEvent, httpRequestHeader, httpToHttps, sessionLost, type ICatalogueMap } from "@misc";
import CatalogueItem from '@components/catalogue-item';
import type { IProduct, IProductIdOrderMap } from '@components/catalogue-item/interfaces';
import { CART_QTY_UPDATE, CART_UPDATE, PRODUCT_UPDATE } from '@misc/event-keys';
import NoItemAvailable from './no-item-available';
import {FilterMasterContext} from './filter/context';
import Filter from './filter';
import type { ICollectionPageResponse, IFilterFacetCountMap, IUrl } from '@misc/interfaces';

const itemPerGroup = 24

const Shop = (p:{
    productIDs:string[];
    productMap:ICatalogueMap;
    cartItemMap:ICartItemMap;
    filterAttributes:{[d:string]:string[]};
    mainProductType:string;
    pathname:string;
    search:string;
    facetCountMap:IFilterFacetCountMap;
}) => {
    let resizeTimeout

    const createProductIdOrderMap = (arr:string[]):IProductIdOrderMap => arr
        .map((id,i)=>{
            console.log(id,i,itemPerGroup,Math.floor(i/itemPerGroup))
            return {[id]:{
                id,
                order:i,
                group:Math.floor(i/itemPerGroup),
                observe:i % itemPerGroup === itemPerGroup - 1
            }}
        })
        .reduce((a,b)=>({...a,...b}),{})

    const [productIdOrderMap,setProductIdOrderMap] = createStore<IProductIdOrderMap>(createProductIdOrderMap(p.productIDs))
    const productIDs = createMemo(()=>!!Object.values(productIdOrderMap).length ? Object.values(productIdOrderMap).sort((a,b)=>a.order - b.order).map(({id})=>id) : [])
    const [productMap, setProductMap] = createStore(p.productMap)
    const [cartItemMap, setCartItemMap] = createStore(p.cartItemMap)
    const pathnamePrefixArr = createMemo(()=>['','collections',p.mainProductType])
    const [currentURL, setCurrentURL] = createStore<IUrl>({
        pathname:p.pathname,
        search:p.search,
        slugOrder:p.pathname.split('/').filter(e=>!pathnamePrefixArr().includes(e)),
    })
    const [facetCountMap, setFacetCountMap] = createStore<IFilterFacetCountMap>(p.facetCountMap)

    const updateURL = async (s:string, slug:string) => {
        const newURL = new URL(s.startsWith('http') ? s : httpToHttps(window.location.origin) + s)

        const resp = await fetch('/api/webshop/shop-page-init',{
            method:'POST',
            headers:httpRequestHeader(false,'client',true),
            body:JSON.stringify({
                slug:newURL.pathname,
                searchParams:newURL.search,
            })
        })

        if (!resp.ok){
            await sessionLost(resp.status)
            return
        }

        const { apiResponse:{
            productIDs:_productIDs,
            productMap:_productMap,
            correctSlugArr:_correctSlugArr,
            facetCountMap:_facetCountMap
        }} = await resp.json() as {apiResponse: ICollectionPageResponse}

        setProductMap(produce(curr=>{
            Object.values(_productMap).forEach(newItem=>{
                curr[newItem.id] = newItem
            })
        }))

        setFacetCountMap(produce(curr=>{
            const newKeys = Object.keys(_facetCountMap)
            const keysToDelete = !!newKeys.length ? Object.keys(curr).filter(e=>!newKeys.includes(e)) : Object.keys(curr)

            if (!!newKeys.length){
                Object.entries(_facetCountMap).forEach(([k,v])=>{
                    curr[k] = v
                })
            }

            if (!!keysToDelete.length) keysToDelete.forEach(e=>{
                curr[e] = undefined
            })
        }))

        const newProductIdOrderMap = createProductIdOrderMap(_productIDs)

        console.log("first: ", newProductIdOrderMap)

        setProductIdOrderMap(produce(curr=>{
            const newKeys = Object.keys(newProductIdOrderMap)
            const keysToDelete = !!newKeys.length ? Object.keys(curr).filter(e=>!newKeys.includes(e)) : Object.keys(curr)

            if (!!newKeys.length){
                newKeys.forEach(e=>{
                    curr[e] = newProductIdOrderMap[e]
                })
            }

            if (!!keysToDelete.length){
                keysToDelete.forEach(e=>{
                    curr[e] = undefined
                })
            }
        }))

        console.log("second: ", newProductIdOrderMap)

        const availableSlugs = Object.keys(_facetCountMap)
        let finalSlugArr = _correctSlugArr.filter(e=>availableSlugs.includes(e))
        
        setCurrentURL(produce(e=>{
            e.pathname = `/collections/${[p.mainProductType, ...finalSlugArr].join('/')}`
            e.search = newURL.search
            if (!!slug){
                e.slugOrder = e.slugOrder.includes(slug) ? e.slugOrder.filter(c=>c!==slug) : [...e.slugOrder,slug]
                e.slugOrder = e.slugOrder.filter(e=>availableSlugs.includes(e))
            }
        }))

        window.history.pushState(null,null,`/collections/${[p.mainProductType, ...finalSlugArr].join('/')}${newURL.search}`)

        window.scrollTo({top:0,left:0,behavior:'smooth'})
    }

    const updateCartQty = (item:ICartItem) => setCartItemMap(produce(e=>{
        e[item.id] = item
        if (!e[item.id].quantity) e[item.id] = undefined
    }))
    const onCartQtyUpdate = (ev:CustomEvent) => {
        const { id:_id, qtyInCart:_qtyInCart } = ev.detail as {id:string;qtyInCart:number}
        setCartItemMap(produce(c=>{
            if (!!c[_id]) c[_id].quantity = _qtyInCart
            else c[_id] = {
                id:_id,
                quantity:_qtyInCart,
                dateAdded:0,
                finalPrice:0
            }

            if (!c[_id].quantity) c[_id] = undefined
        }))
    }

    const onProductUpdate = (ev:CustomEvent) => {
        const productDetailsArr = ev.detail as IProduct[]
        setProductMap(produce(currentMap=>{
            productDetailsArr.forEach(newPd=>{
                if (!!currentMap[newPd.id]){
                    currentMap[newPd.id].stockQuantities = [...newPd.stockQuantities]
                    currentMap[newPd.id].price = newPd.price
                    currentMap[newPd.id].discountedPrice = newPd.discountedPrice
                }
            })
        }))
    }

    const onWsCartUpdate = (ev:CustomEvent) => {
        const { cartItemMap:_cartItemMap } = ev.detail as IAddToBagResponse
        setCartItemMap(produce(e=>{
            e = {..._cartItemMap}
        }))
    }

    const onResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(catalogueItemsOnResize,200)
    }

    const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(entry=>{
            if (entry.isIntersecting){
                setProductIdOrderMap(produce(e=>{
                    const ids = Object.keys(e)
                    ids.forEach(c=>{
                        e[c].group = Math.max(0, e[c].group - 1)
                    })
                }))
                observer.unobserve(entry.target)
            }
        })
    }

    const onOnline = async () => {
        const chunkLen = Math.ceil(productIDs().length / itemPerGroup)
        const chunks = Array(chunkLen).fill(undefined).map((_,i)=>productIDs().slice(i * itemPerGroup, i * itemPerGroup + itemPerGroup))
        try {
            const responses = await Promise.all(chunks.map(chunk => fetch(`/api/webshop/shop-page`,{
                method:"POST",
                headers:httpRequestHeader(false,'client',false),
                body:JSON.stringify({ids:chunk})
            })))
            const jsons = await Promise.all(responses.map(resp => resp.json())) as {apiResponse:{productDetails:IProduct[]}}[]
            const productDetails = jsons.map(e=>e.apiResponse.productDetails).flat()
            dispatchInternalEvent(PRODUCT_UPDATE,productDetails)
        } catch { return }
    }

    onMount(()=>{
        catalogueItemsOnResize()
        window.addEventListener('resize',onResize,true)
        window.addEventListener('online',onOnline,true)

        document.addEventListener(CART_QTY_UPDATE,onCartQtyUpdate,true)
        document.addEventListener(PRODUCT_UPDATE,onProductUpdate,true)
        document.addEventListener(CART_UPDATE,onWsCartUpdate,true)

        onCleanup(()=>{
            window.removeEventListener('resize',onResize,true)
            window.removeEventListener('online',onOnline,true)
            document.removeEventListener(CART_QTY_UPDATE,onCartQtyUpdate,true)
            document.removeEventListener(PRODUCT_UPDATE,onProductUpdate,true)
            document.removeEventListener(CART_UPDATE,onWsCartUpdate,true)
        })
    })
    
    return (
        <div>
            <FilterMasterContext.Provider 
                value={{
                    filterAttributes:p.filterAttributes,
                    mainProductType:p.mainProductType,
                    currentURL,
                    updateURL,
                    facetCountMap,
                    pathnamePrefixArr:pathnamePrefixArr(),
                }}
                children={<Filter />}
            />
            <Show 
                when={!!productIDs().length} 
                fallback={<NoItemAvailable />} 
                children={
                    <div 
                        class="pt-3 pb-5 px-3 md:px-4 grid grid-cols-2 gap-x-1 2xs:gap-x-2 sm:grid-cols-3 md:gap-x-4 2xl:grid-cols-4 gap-y-8"
                    >
                        <CatalogueItemContext.Provider 
                            value={{
                                productMap,
                                cartItemMap,
                                productIdOrderMap,
                                observerCallback,
                            }} 
                            children={
                                <For 
                                    each={productIDs()}
                                    children={(id,index)=>(
                                        <CatalogueItem {...{
                                            id,
                                            productPageRelatedProduct:false,
                                            index:index(),
                                            isProductPage:true,
                                            updateCartQty,
                                        }} />
                                    )}
                                />
                            }
                        />
                    </div>
                }
            />
        </div>
    )
}

export default Shop