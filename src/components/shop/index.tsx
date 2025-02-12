import { For, onMount, onCleanup, createMemo, Show, createSignal, createEffect } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import CatalogueItemContext from '@components/catalogue-item/context'
import type { IAddToBagResponse, ICartItem, ICartItemMap } from "@components/cart/interfaces";
import { catalogueItemsOnResize, dispatchInternalEvent, getCollectionPageTitle, httpRequestHeader, httpToHttps, sessionLost, type ICatalogueMap } from "@misc";
import CatalogueItem from '@components/catalogue-item';
import type { IProduct, IProductIdOrderMap } from '@components/catalogue-item/interfaces';
import { CART_QTY_UPDATE, CART_UPDATE, PRODUCT_UPDATE } from '@misc/event-keys';
import NoItemAvailable from './no-item-available';
import {FilterMasterContext} from './filter/context';
import Filter from './filter';
import type { ICollectionPageResponse, IFilterFacetCountMap, IUrl } from '@misc/interfaces';
import { useStore } from '@nanostores/solid';
import { headerScrollLimit } from '@stores';
import { SortHybridWrapper } from './filter/filter-hybrid';
import { BelowTheFold } from './filter/collection-description';

const itemPerGroup = 24

const bottomNavHeight = '40px'

const bottomSheetFilterCheckboxID = 'bottom-sheet-filter-checkbox'

const Shop = (p:{
    productIDs:string[];
    productMap:ICatalogueMap;
    cartItemMap:ICartItemMap;
    filterAttributes:{[d:string]:string[]};
    mainProductType:string;
    pathname:string;
    search:string;
    facetCountMap:IFilterFacetCountMap;
    aboveTheFold:string;
    belowTheFold:string;
}) => {
    let resizeTimeout, mobileFilterDivCheckboxRef, containerRef, mobileBottomNavRef

    const [productIdOrderMap,setProductIdOrderMap] = createStore<IProductIdOrderMap>(
        p.productIDs
            .map((id,i)=>({[id]:{
                id,
                order:i,
                group:Math.floor(i/itemPerGroup),
                observe:i % itemPerGroup === itemPerGroup - 1
            }}))
            .reduce((a,b)=>({...a,...b}),{})
    )
    const _headerScrollLimit = useStore(headerScrollLimit)
    const [lastScrollY,setLastScrollY] = createSignal(0)
    const [loading, setLoading] = createSignal(false)
    const [screenWidth, setScreenWidth] = createSignal(0)
    const [bottomNavSticky,setBottomNavSticky] = createSignal(false)
    const productIDs = createMemo(()=>!!Object.values(productIdOrderMap).length ? Object.values(productIdOrderMap).sort((a,b)=>a.order - b.order).map(({id})=>id) : [])
    const [productMap, setProductMap] = createStore(p.productMap)
    const [descriptions, setDescriptions] = createStore({
        aboveTheFold:p.aboveTheFold,
        belowTheFold:p.belowTheFold
    })
    const [cartItemMap, setCartItemMap] = createStore(p.cartItemMap)
    const pathnamePrefixArr = createMemo(()=>['','collections',p.mainProductType])
    const [currentURL, setCurrentURL] = createStore<IUrl>({
        pathname:p.pathname,
        search:p.search,
        slugOrder:p.pathname.split('/').filter(e=>!pathnamePrefixArr().includes(e)),
    })
    const [facetCountMap, setFacetCountMap] = createStore<IFilterFacetCountMap>(p.facetCountMap)

    const updateLoading = (v:boolean) => setLoading(v)

    const updateURL = async (s:string, slug:string) => {
        setLoading(true)
        
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
            setLoading(false)
            return false
        }

        const { apiResponse:{
            productIDs:_productIDs,
            productMap:_productMap,
            correctSlugArr:_correctSlugArr,
            facetCountMap:_facetCountMap,
            aboveTheFold:_aboveTheFold,
            belowTheFold:_belowTheFold,
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

        setProductIdOrderMap(produce(curr=>{
            const newProductLen = _productIDs.length
            const keysToDelete = !!newProductLen ? Object.keys(curr).filter(e=>!_productIDs.includes(e)) : Object.keys(curr)

            for (let i=0; i<newProductLen; i++){
                const id = _productIDs[i]
                if (!!curr[id]){
                    curr[id].order = i
                    curr[id].group = Math.floor(i / itemPerGroup)
                    curr[id].observe = i % itemPerGroup === itemPerGroup - 1
                } else {
                    curr[id] = {
                        id,
                        order:i,
                        group:Math.floor(i / itemPerGroup),
                        observe:i % itemPerGroup === itemPerGroup - 1
                    }
                }
            }

            if (!!keysToDelete.length){
                keysToDelete.forEach(e=>{
                    curr[e] = undefined
                })
            }
        }))

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

        setDescriptions(produce(e=>{
            e.aboveTheFold = _aboveTheFold
            e.belowTheFold = _belowTheFold
        }))

        window.history.pushState(null,null,`/collections/${[p.mainProductType, ...finalSlugArr].join('/')}${newURL.search}`)

        const newTitle = getCollectionPageTitle([p.mainProductType, ...finalSlugArr],p.filterAttributes)
        document.title = newTitle

        window.scrollTo({top:0,left:0,behavior:'smooth'})

        setLoading(false)

        return true
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
        resizeTimeout = setTimeout(()=>{
            setScreenWidth(window.innerWidth)
            catalogueItemsOnResize()
        },200)
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

    const bottomObserverCallback = (entries:IntersectionObserverEntry[]) => {
        entries.forEach(entry=>{
            setBottomNavSticky(!entry.isIntersecting)
        })
    }

    const onScroll = () => {
        if (Math.abs(window.scrollY - lastScrollY()) > _headerScrollLimit()){
            const check = window.scrollY > lastScrollY()
            if (mobileFilterDivCheckboxRef.checked !== check) mobileFilterDivCheckboxRef.checked = check
        }
        setLastScrollY(window.scrollY)
    }

    createEffect(()=>{
        if (screenWidth() < 475 && bottomNavSticky()) window.addEventListener('scroll',onScroll);
        else window.removeEventListener('scroll',onScroll);
    })

    onMount(()=>{
        const footer = document.getElementsByTagName('footer')[0] as HTMLElement
        const footerObserver = new IntersectionObserver(bottomObserverCallback,{rootMargin:bottomNavHeight})
        footerObserver.observe(footer)

        setLastScrollY(window.scrollY)
        setScreenWidth(window.innerWidth)
        catalogueItemsOnResize()
        window.addEventListener('resize',onResize,true)
        window.addEventListener('online',onOnline,true)

        document.addEventListener(CART_QTY_UPDATE,onCartQtyUpdate,true)
        document.addEventListener(PRODUCT_UPDATE,onProductUpdate,true)
        document.addEventListener(CART_UPDATE,onWsCartUpdate,true)

        onCleanup(()=>{
            footerObserver.disconnect()
            window.removeEventListener('resize',onResize,true)
            window.removeEventListener('online',onOnline,true)
            window.removeEventListener('scroll',onScroll);
            document.removeEventListener(CART_QTY_UPDATE,onCartQtyUpdate,true)
            document.removeEventListener(PRODUCT_UPDATE,onProductUpdate,true)
            document.removeEventListener(CART_UPDATE,onWsCartUpdate,true)
        })
    })
    
    return (
        <div ref={containerRef}>
            <FilterMasterContext.Provider 
                value={{
                    filterAttributes:p.filterAttributes,
                    mainProductType:p.mainProductType,
                    currentURL,
                    updateURL,
                    facetCountMap,
                    pathnamePrefixArr:pathnamePrefixArr(),
                    updateLoading,
                    bottomSheetFilterCheckboxID,
                    descriptions,
                }}
                children={<Filter loading={loading()} productCount={productIDs().length} />}
            />
            <Show 
                when={!!productIDs().length} 
                fallback={<NoItemAvailable />} 
                children={
                    <div class="pt-3 pb-5 px-3 md:px-4 grid grid-cols-2 gap-x-1 2xs:gap-x-2 sm:grid-cols-3 md:gap-x-4 2xl:grid-cols-4 gap-y-8">
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
            <input ref={mobileFilterDivCheckboxRef} type="checkbox" hidden class="peer/hidemobilefilterdiv" />
            <FilterMasterContext.Provider 
                value={{
                    filterAttributes:p.filterAttributes,
                    mainProductType:p.mainProductType,
                    currentURL,
                    updateURL,
                    facetCountMap,
                    pathnamePrefixArr:pathnamePrefixArr(),
                    updateLoading,
                    bottomSheetFilterCheckboxID,
                    descriptions,
                }}
                children={<BelowTheFold />}
            />
            <div 
                ref={mobileBottomNavRef} 
                class="xs:hidden z-10 bottom-0 w-full bg-white border-t border-gray-300 divide-x grid grid-cols-2"
                style={{height:bottomNavHeight}}
                classList={{
                    'sticky':bottomNavSticky(),
                    'peer-checked/hidemobilefilterdiv:translate-y-full':bottomNavSticky(),
                    'duration-300':bottomNavSticky(),
                }}
            >
                <FilterMasterContext.Provider 
                    value={{
                        filterAttributes:p.filterAttributes,
                        mainProductType:p.mainProductType,
                        currentURL,
                        updateURL,
                        facetCountMap,
                        pathnamePrefixArr:pathnamePrefixArr(),
                        updateLoading,
                        bottomSheetFilterCheckboxID,
                        descriptions,
                    }}
                    children={
                        <SortHybridWrapper 
                            children={
                                <>
                                <span class="my-auto">Sort</span>
                                <svg viewBox="0 0 20 20" class="ml-2 my-auto w-4 h-4 stroke-1 stroke-black fill-none" stroke-linecap="round">
                                    <use href="#sort-arrow" x="-3" y="-3" />
                                    <g transform="translate(18,18) rotate(180)">
                                        <use href="#sort-arrow" x="-7" y="-5" />
                                    </g>
                                </svg>
                                </>
                            }
                            labelClassName='flex justify-center text-xs uppercase tracking-widest h-full'
                            containerClassName='relative'
                        />
                    }
                />
                <label for={bottomSheetFilterCheckboxID} class="uppercase text-xs tracking-widest flex justify-center cursor-pointer">
                    <span class="my-auto">Filter</span>
                    <svg class="ml-2 my-auto w-4 h-4 stroke-1 stroke-black fill-none">
                        <use href='#collection-filter' />
                    </svg>
                </label>
            </div>
        </div>
    )
}

export default Shop