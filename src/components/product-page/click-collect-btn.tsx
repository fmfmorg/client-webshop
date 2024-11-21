import { createMemo, Show, createContext, useContext, onMount, onCleanup } from 'solid-js'
import { useStore } from "@nanostores/solid"
import { preferredCollectionPoint, shopNameMap } from "@stores"
import type { IProduct } from '@components/catalogue-item/interfaces'
import { createStore, produce } from 'solid-js/store';
import { PRODUCT_UPDATE } from '@misc/event-keys';

interface IContext {
    product:IProduct;
}

const Context = createContext<IContext>()

const CollectionPointSelected = () => {
    const $preferredCollectionPoint = useStore(preferredCollectionPoint)
    const $shopNameMap = useStore(shopNameMap)
    const shopName = createMemo(()=>$shopNameMap()[$preferredCollectionPoint()])
    const { product } = useContext(Context)
    const shopStockQty = createMemo(()=>product.stockQuantities.find(e=>e.address===$preferredCollectionPoint())?.quantity || 0)

    return (
        <label for="product-collection-points-sidebar-checkbox">
            <div class='rounded-md p-2 border border-gray-300 mb-4 cursor-pointer'>
                <p class='font-semibold'>{shopName()} store</p>
                <p class='list-disc list-inside text-sm tracking-wide'>
                    <span class='font-light text-xs tracking-widest uppercase'>Click & Collect - </span>
                    <span class={shopStockQty() > 3 ? 'text-green-600' : 'text-red-600'}>
                        {shopStockQty() > 3 ? 'In stock' : !!shopStockQty() ? `Low stock - only ${shopStockQty()} available.` : 'Currently unavailable.'}
                    </span>
                </p>
            </div>
        </label>
    )
}

const CollectionPointNotSelected = () => {
    return (
        <label for="product-collection-points-sidebar-checkbox">
            <div class='rounded-md p-2 border border-gray-300 mb-4 cursor-pointer'>
                <p class='uppercase text-sm font-semibold tracking-widest'>Click & Collect</p>
                <p class='uppercase text-xs tracking-widest'>Check Store Availability</p>
            </div>
        </label>
    )
}

const MultipleShopsAvailable = () => {
    const $preferredCollectionPoint = useStore(preferredCollectionPoint)

    return (
        <Show
            when={!!$preferredCollectionPoint()}
            children={<CollectionPointSelected />}
            fallback={<CollectionPointNotSelected />}
        />
    )
}

const OneShopAvailable = () => {
    const $shopNameMap = useStore(shopNameMap)
    const shopName = createMemo(()=>Object.values($shopNameMap())[0])
    const shopAddressID = createMemo(()=>+Object.keys($shopNameMap())[0])
    const { product } = useContext(Context)
    const shopStockQty = createMemo(()=>product.stockQuantities.find(e=>e.address===shopAddressID())?.quantity || 0)

    return (
        <label for="product-collection-points-sidebar-checkbox">
            <div class='rounded-md p-2 border border-gray-300 mb-4 cursor-pointer'>
                <p class='font-semibold'>{shopName()} store</p>
                <p class='list-disc list-inside text-sm tracking-wide'>
                    <span class='font-light text-xs tracking-widest uppercase'>Click & Collect - </span>
                    <span class={shopStockQty() > 3 ? 'text-green-600' : 'text-red-600'}>
                        {shopStockQty() > 3 ? 'In stock' : !!shopStockQty() ? `Low stock - only ${shopStockQty()} available.` : 'Currently unavailable.'}
                    </span>
                </p>
            </div>
        </label>
    )
}

const ShopAddressesAvailble = () => {
    const $shopNameMap = useStore(shopNameMap)
    const shopAddressCount = createMemo(()=>Object.keys($shopNameMap()).length)

    return (
        <Show 
            when={shopAddressCount() > 1}
            children={<MultipleShopsAvailable />}
            fallback={<OneShopAvailable />}
        />
    )
}

const ClickCollectBtnContent = () => {
    const $shopNameMap = useStore(shopNameMap)
    const hasShopAddresses = createMemo(()=>!!Object.keys($shopNameMap()).length)

    return (
        <Show 
            when={hasShopAddresses()}
            children={<ShopAddressesAvailble />}
        />
    )
}

const ClickCollectBtn = (p:{product:IProduct}) => {
    const [product,setProduct] = createStore(p.product)
    const productID = createMemo(()=>product.id)

    const onProductUpdate = (ev:CustomEvent) => {
        const products = ev.detail as IProduct[]
        const matchingProduct = products.find(e=>e.id === productID())
        if (!!matchingProduct) setProduct(produce(e=>{
            e.stockQuantities = [...matchingProduct.stockQuantities]
        }))
    }

    onMount(()=>{
        document.addEventListener(PRODUCT_UPDATE,onProductUpdate,true)
        onCleanup(()=>{
            document.removeEventListener(PRODUCT_UPDATE,onProductUpdate,true)
        })
    })

    return (
        <Context.Provider 
            value={{product}} 
            children={<ClickCollectBtnContent />}
        />
    )
}

export default ClickCollectBtn