import { createContext, For, useContext, createMemo, Show, onMount, onCleanup } from "solid-js";
import { createStore, produce } from 'solid-js/store'
import { dispatchInternalEvent, httpRequestHeader, sessionLost, setLoading, showErrorModal, type ICatalogueMap, type IShopAddress, type IShopAddressMap } from "@misc";
import type { IAddToBagResponse, ICartItemMap } from "@components/cart/interfaces";
import Image from "@components/cart/image";
import { selectedCollectionPoint } from "@stores";
import { ADD_TO_BAG_FROM_CATALOGUE, CART_UPDATE, PRODUCT_UPDATE, UPDATE_CART_ITEM_MAP } from "@misc/event-keys";
import type { IProduct } from "@components/catalogue-item/interfaces";

interface IContext {
    cartItemMap: ICartItemMap;
    shopAddressMap:IShopAddressMap;
    productDetailsMap: ICatalogueMap;
}

const ClickCollectContext = createContext<IContext>();

const ProblemCartItem = (p:{productID:string;addressID:number;}) => {
    const { cartItemMap, productDetailsMap } = useContext(ClickCollectContext)
    const qtyInCart = createMemo(()=>cartItemMap[p.productID].quantity)
    const qtyAvailable = createMemo(()=>productDetailsMap[p.productID].stockQuantities.find(e=>e.address===p.addressID)?.quantity || 0)
    const name = createMemo(()=>productDetailsMap[p.productID].name)
    const image = createMemo(()=>productDetailsMap[p.productID].images[0])
    return (
        <li class='grid grid-flow-dense grid-cols-3 xs:grid-cols-4'>
            <Image name={image().name} ext={image().ext} />
            <div class='col-span-2 xs:col-span-3 flex flex-col justify-center text-sm'>
                <p class='tracking-wide font-light'>{name}</p>
                <p>{qtyAvailable} of {qtyInCart} available</p>
            </div>
        </li>
    )
}

const ProblemItemElem = (p:{addressID:number}) => {
    const { cartItemMap, productDetailsMap } = useContext(ClickCollectContext)
    const lowStockItemIDs = createMemo(()=>
        Object.values(cartItemMap)
        .filter(e=>e.quantity > (productDetailsMap[e.id].stockQuantities.find(d=>d.address===p.addressID)?.quantity || 0))
        .map(e=>e.id)
    )

    return (
        <div class='my-2'>
            <ul>
                <For each={lowStockItemIDs()} children={e=><ProblemCartItem {...{productID:e,addressID:p.addressID}} />} />
            </ul>
            <p class='text-xs'>If you choose to collect from this shop, the quantities in your shopping bag will be adjusted accordingly.</p>
        </div>
    )
}

const ShopAddressListItem = (
    p:{
        address:IShopAddress;
    }
) => {
    const { cartItemMap, productDetailsMap } = useContext(ClickCollectContext)
    const hasLowStockItems = createMemo(()=>
        !!Object.values(cartItemMap)
        .filter(e=>e.quantity > (productDetailsMap[e.id].stockQuantities.find(d=>d.address===p.address.id)?.quantity || 0))
        .map(e=>e.id)
        .length
    )
    const onClick = async() => {
        setLoading(true)

        const modalCheckbox = document.getElementById("select-click-collect-point-modal-checkbox") as HTMLInputElement
        const clickCollectCheckbox = document.getElementById('collect') as HTMLInputElement

        const resp = await fetch(`/api/webshop/select-collection-point/${p.address.id}`,{
            headers:httpRequestHeader(false,'client',true,true)
        })
        if (!resp.ok){
            if (await sessionLost(resp.status)) return
            const prevAddressID = selectedCollectionPoint.get()
            if (!prevAddressID){
                const clickCollectCheckbox = document.getElementById('collect') as HTMLInputElement
                if (!!clickCollectCheckbox) clickCollectCheckbox.checked = false
            } else if (prevAddressID === 1){
                const homeDeliveryCheckbox = document.getElementById('delivery') as HTMLInputElement
                if (!!homeDeliveryCheckbox) homeDeliveryCheckbox.checked = true
            }
            setLoading(false)
            showErrorModal("Sorry, we're unable to update your collection point due to a system error. Please try again later.")
            return
        }
        selectedCollectionPoint.set(p.address.id)
        const {apiResponse} = await resp.json() as {apiResponse:IAddToBagResponse}

        dispatchInternalEvent(ADD_TO_BAG_FROM_CATALOGUE,apiResponse)

        modalCheckbox.checked = false
        clickCollectCheckbox.checked = true
        setLoading(false)
    }

    return (
        <li class='rounded-md border-2 border-gray-200 p-2 mt-2'>
            <input type='checkbox' hidden checked name='click-collect-point' id={`click-collect-point-${p.address.id}`} class='peer click-collect-point' />
            <label for={`click-collect-point-${p.address.id}`} class='cursor-pointer'>
                <p class='font-semibold'>{p.address.name}</p>
                <p class='text-sm font-light'>{
                    [
                        p.address.line1,
                        p.address.line2,
                        p.address.city,
                        p.address.stateProvince,
                        p.address.postcode,
                    ].filter(e=>!!e).join(', ')
                }</p>
                <ul>
                    <li class={`list-disc list-inside ${hasLowStockItems() ? 'text-red-600' : 'text-green-600'} text-xs tracking-wide`}>
                        {hasLowStockItems() ? 'Some items are unavailable.' : 'All items are availabe.'}
                    </li>
                </ul>
            </label>
            <div class='max-h-0 overflow-y-hidden peer-checked:max-h-fit transition-all duration-300'>
                <Show 
                    when={hasLowStockItems()} 
                    children={<ProblemItemElem addressID={p.address.id} />}
                />
                <button onClick={onClick} class='text-center w-full text-xs tracking-widest uppercase p-2 bg-gray-600 text-white font-serif mouse:hover:bg-black duration-300 mt-2'>Select this shop</button>
            </div>
        </li>
    )
}

const SelectClickCollectPointContent = () => {
    let checkboxRef
    const {shopAddressMap} = useContext(ClickCollectContext)
    const shopAddresses = createMemo(()=>Object.values(shopAddressMap))

    return (
        <div>
            <input ref={checkboxRef} type="checkbox" hidden id="select-click-collect-point-modal-checkbox" class='peer' />
            <div class='fixed w-screen h-screen top-0 left-0 bg-gray-600 opacity-50 z-50 hidden peer-checked:block' />
            <div class="hidden peer-checked:flex flex-col justify-center z-50 fixed w-full h-screen top-0 left-0 px-4">
                <div class="max-w-96 w-full bg-white mx-auto p-4 rounded-md">
                    <div class='flex justify-between'>
                        <div class='flex flex-col justify-center'>
                            <p class='uppercase text-sm tracking-widest [word-spacing:0.15rem]'>Select Collection Point</p>
                        </div>
                        <label for="select-click-collect-point-modal-checkbox" class='cursor-pointer'>
                            <svg viewBox="0 0 100 100" height='2rem' stroke-linecap="round" stroke="black" stroke-width='0.2rem'>
                                <line x1="20" y1="20" x2="80" y2="80" />
                                <line x1="20" y1="80" x2="80" y2="20" />
                            </svg>
                        </label>
                    </div>
                    <ul>
                        <For 
                            each={shopAddresses()}
                            children={e=><ShopAddressListItem address={e} />}
                        />
                    </ul>
                </div>
            </div>
        </div>
    )
}


const SelectClickCollectPoint = (
    p:{
        shopAddressMap:IShopAddressMap;
        itemsMap:ICartItemMap;
        productDetailsMap: ICatalogueMap;
    }
) => {
    const [cartItemMap, setCartItemMap] = createStore(p.itemsMap)
    const [productDetailsMap,setProductDetailsMap] = createStore(p.productDetailsMap)

    const updateProductDetails = (productDetails:IProduct[]) => setProductDetailsMap(produce(e=>{
        productDetails.forEach(d=>{
            if (!!e[d.id]){
                e[d.id].createdAt = d.createdAt
                e[d.id].description = d.description
                e[d.id].discountedPrice = d.discountedPrice
                e[d.id].images = d.images
                e[d.id].name = d.name
                e[d.id].price = d.price
                e[d.id].stockQuantities = [...d.stockQuantities]
                e[d.id].totalSales = d.totalSales
                e[d.id].url = d.url
            } else e[d.id] = d
        })
    }))

    const onProductsUpdate = (ev:CustomEvent) => {
        const productDetails = ev.detail as IProduct[]
        updateProductDetails(productDetails)
    }

    const wsUpdateCart = (ev:CustomEvent) => {
        const e = ev.detail as IAddToBagResponse

        const { cartItemMap: _cartItemMap, productDetails } = e
        updateProductDetails(productDetails)

        const newMapIDs = Object.keys(_cartItemMap)

        setCartItemMap(produce(c=>{
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
    }

    onMount(()=>{
        document.addEventListener(UPDATE_CART_ITEM_MAP, wsUpdateCart, true);
        document.addEventListener(PRODUCT_UPDATE, onProductsUpdate, true);
        document.addEventListener(CART_UPDATE,wsUpdateCart, true)

        onCleanup(()=>{
            document.removeEventListener(UPDATE_CART_ITEM_MAP, wsUpdateCart, true);
            document.removeEventListener(PRODUCT_UPDATE, onProductsUpdate, true);
            document.removeEventListener(CART_UPDATE,wsUpdateCart, true)
        })
    })

    return (
        <div id='select-click-collect-point-modal'>
            <ClickCollectContext.Provider 
                value={{cartItemMap,shopAddressMap:p.shopAddressMap,productDetailsMap}} 
                children={<SelectClickCollectPointContent />}
            />
        </div>
    )
}

export default SelectClickCollectPoint