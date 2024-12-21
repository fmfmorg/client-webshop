import { createMemo, For, onMount, onCleanup } from 'solid-js'
import { createStore, produce } from "solid-js/store";
import type { IProduct } from "@components/catalogue-item/interfaces";
import { httpRequestHeader, sessionLost, type IShopAddress, type IShopAddressMap } from "@misc";
import { preferredCollectionPoint } from '@stores';
import { PRODUCT_UPDATE } from '@misc/event-keys';
import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/client';

const CollectionPointItem = (
    p:{
        shopAddress:IShopAddress;
        stockQty:number;
        onClick:()=>void;
    }
) => (
    <li class='p-1'>
        <div class='cursor-pointer p-2' onClick={p.onClick}>
            <p class='font-semibold'>{p.shopAddress.name}</p>
            <p class='font-light text-sm'>{
                [
                    p.shopAddress.line1,
                    p.shopAddress.line2,
                    p.shopAddress.city,
                    p.shopAddress.stateProvince,
                    p.shopAddress.postcode,
                ].filter(e=>!!e).join(', ')
            }</p>
            <ul>
                <li class={`list-disc list-inside ${p.stockQty > 3 ? 'text-green-600' : 'text-red-600'} text-sm tracking-wide`}>
                    {p.stockQty > 3 ? 'In stock' : !!p.stockQty ? `Low stock - only ${p.stockQty} available.` : 'Currently unavailable.'}
                </li>
            </ul>
        </div>
    </li>
)

const CollectionPointsSidebar = (
    p:{
        shopAddressMap:IShopAddressMap;
        product:IProduct;
    }
) => {
    let listRef, headerRef, sidebarRef, checkboxRef, resizeTimeout, labelRef
    const shopAddresses = createMemo(()=>Object.values(p.shopAddressMap).sort((a,b)=>a.name > b.name ? 1 : -1))
    const [stockQtyMap,setStockQtyMap] = createStore(p.product.stockQuantities.map(e=>({[e.address]:e.quantity})).reduce((a,b)=>({...a,...b}),{}))

    const resize = () => {
        const { innerHeight } = window
        const { height: headerHeight } = (document.getElementsByTagName('header')[0] as HTMLElement).getBoundingClientRect()
        const { height: sidebarHeaderHeight } = headerRef.getBoundingClientRect()
        listRef.style.height = `${innerHeight - headerHeight - sidebarHeaderHeight}px`
    }
    const onResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(resize,100)
    }

    const itemOnClick = (addressID:number) => async () => {
        checkboxRef.click()
        preferredCollectionPoint.set(addressID)
        const resp = await fetch(`${FM_CLIENT_WEBSHOP_API_URL}/webshop/set-preferred-collection-point/${addressID}`,{
            headers:httpRequestHeader(false,'client',true)
        })
        await sessionLost(resp.status)
    }

    const checkBoxOnClick = (e:Event) => {
        e.stopImmediatePropagation()
        const checked = (e.target as HTMLInputElement).checked
        const header = document.getElementsByTagName('header')[0] as HTMLElement
        if (checked && !!header) header.classList.remove('-translate-y-full')
        const main = document.getElementsByTagName('main')[0] as HTMLElement
        const footer = document.getElementsByTagName('footer')[0] as HTMLElement
        main.classList.toggle('blur-sm',checked)
        footer.classList.toggle('blur-sm',checked)
        if (checked) {
            resize()
            window.addEventListener('resize',onResize,true)
        } else window.removeEventListener('resize',onResize,true)
    }

    const documentOnClick = () => {
        if (checkboxRef.checked) checkboxRef.click()
    }

    const onProductUpdate = (ev:CustomEvent) => {
        const products = ev.detail as IProduct[]
        const matchingProduct = products.find(e=>e.id === p.product.id)
        if (!matchingProduct) return

        const currentAddressIDs = Object.keys(stockQtyMap)
        setStockQtyMap(produce(e=>{
            Object.keys(e).forEach(d=>{
                e[d] = matchingProduct.stockQuantities.find(c=>c.address === +d)?.quantity || 0
            })

            currentAddressIDs.forEach(d=>{
                e[d] = matchingProduct.stockQuantities.find(c=>c.address === +d)?.quantity || 0
            })
        }))
    }

    onMount(()=>{
        const isDesktop = window.matchMedia && matchMedia("(pointer:fine)").matches;
        const header = document.getElementsByTagName('header')[0] as HTMLDivElement
        
        document.addEventListener(PRODUCT_UPDATE,onProductUpdate,true)
        if (isDesktop) header.addEventListener('click',documentOnClick,true)
        else header.addEventListener('touchstart',documentOnClick,{passive:false})

        onCleanup(()=>{
            document.removeEventListener(PRODUCT_UPDATE,onProductUpdate,true)
            if (isDesktop) header.removeEventListener('click',documentOnClick,true)
            else header.removeEventListener('touchstart',documentOnClick)
        })
    })

    return (
        <div>
            <input ref={checkboxRef} onClick={checkBoxOnClick} type='checkbox' hidden id='product-collection-points-sidebar-checkbox' class='peer' />
            <label ref={labelRef} for='product-collection-points-sidebar-checkbox' class='fixed top-0 left-0 w-screen h-screen hidden z-20 peer-checked:block' />
            <div ref={sidebarRef} class='fixed right-[-400px] bottom-0 peer-checked:right-0 w-full max-w-[400px] bg-white shadow-lg transition-all duration-300 z-50'>
                <div ref={headerRef} class='flex justify-between' id='product-collection-points-sidebar-header'>
                    <p class='flex flex-col justify-center ml-3 font-display text-2xl xs:text-3xl tracking-[-0.1em] [word-spacing:0.3em]'>Select Store</p>
                    <label for='product-collection-points-sidebar-checkbox' class="py-1 px-1 bg-white transition-all duration-300 cursor-pointer">
                        <svg viewBox="0 0 100 100" height='2.5em' stroke-linecap="round" stroke="black" stroke-width='0.2rem'>
                            <line x1="20" y1="20" x2="80" y2="80" />
                            <line x1="20" y1="80" x2="80" y2="20" />
                        </svg>
                    </label>
                </div>
                <ul ref={listRef} id='product-collection-points-list' class='hide-scrollbar overflow-y-scroll divide-y'>
                    <For
                        each={shopAddresses()}
                        children={(e:IShopAddress)=><CollectionPointItem {...{shopAddress:e,stockQty:stockQtyMap[e.id] || 0,onClick:itemOnClick(e.id)}} />}
                    />
                </ul>
            </div>
        </div>
    )
}

export default CollectionPointsSidebar