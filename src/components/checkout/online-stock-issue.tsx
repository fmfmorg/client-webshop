import { createMemo, For, onMount, onCleanup } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import type { IAddToBagResponse, ICartItemMap } from "@components/cart/interfaces";
import { dispatchInternalEvent, httpRequestHeader, sessionLost, setLoading, showErrorModal, type ICatalogueMap } from "@misc";
import type { IProduct, IProductImages } from '@components/catalogue-item/interfaces';
import Image from "@components/cart/image";
import { selectedCollectionPoint } from '@stores';
import { ADD_TO_BAG_FROM_CATALOGUE, CART_UPDATE, PRODUCT_UPDATE, UPDATE_CART_ITEM_MAP } from '@misc/event-keys';

interface IProductWithIssue {
    id:string;
    name:string;
    image: IProductImages;
    qtyAvailable:number;
}

const ItemWithIssue = (
    p:{
        id:string;
        qtyInCart:number;
        pd:IProductWithIssue;
    }
) => (
    <li class='grid grid-flow-dense grid-cols-3 xs:grid-cols-4'>
        <Image name={p.pd.image.name} ext={p.pd.image.ext} alt={p.pd.name} imageSize={256} />
        <div class='col-span-2 xs:col-span-3 flex flex-col justify-center text-sm'>
            <p class='tracking-wide font-light'>{p.pd.name}</p>
            <p>{p.pd.qtyAvailable} of {p.qtyInCart} available</p>
        </div>
    </li>
)

const OnlineStockIssue = (
    p:{
        itemsMap:ICartItemMap;
        productDetailsMap:ICatalogueMap;
    }
) => {
    let checkboxRef
    const [cartItemMap,setCartItemMap] = createStore(p.itemsMap)
    const [productDetailsMap,setProductDetailsMap] = createStore<{[k:string]:IProductWithIssue}>(
        Object.values(p.productDetailsMap)
        .map(e=>({
            [e.id]:{
                id:e.id,
                name:e.name,
                image:e.images[0],
                qtyAvailable:e.stockQuantities.find(d=>d.address===1)?.quantity || 0
            }
        }))
        .reduce((a,b)=>({...a,...b}),{})
    )

    const problemItemIDs = createMemo(()=>Object.values(cartItemMap).filter(e=>e.quantity > productDetailsMap[e.id].qtyAvailable).map(e=>e.id))

    const uncheckHomeDeliveryIfNoStock = () => {
        if (!!problemItemIDs().length && selectedCollectionPoint.get() === 1) {
            const homeDeliveryCheckbox = document.getElementById('delivery') as HTMLInputElement
            if (!!homeDeliveryCheckbox) homeDeliveryCheckbox.checked = false
            selectedCollectionPoint.set(0)
        }
    }

    const updateProductDetails = (productDetails:IProduct[]) => setProductDetailsMap(produce(e=>{
        productDetails.forEach(product=>{
            if (!!e[product.id]) {
                e[product.id].qtyAvailable = product.stockQuantities.find(d=>d.address === 1)?.quantity || 0
            } else {
                e[product.id] = {
                    id:product.id,
                    name:product.name,
                    image:product.images[0],
                    qtyAvailable:product.stockQuantities.find(d=>d.address === 1)?.quantity || 0
                }
            }
        })
    }))

    const onProductsUpdate = (ev:CustomEvent) => {
        const productDetails = ev.detail as IProduct[]
        updateProductDetails(productDetails)
        uncheckHomeDeliveryIfNoStock()
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
        uncheckHomeDeliveryIfNoStock()
    }

    const updateCartPerWarehouseStock = async() => {
        checkboxRef.checked = false
        setLoading(true)

        const resp = await fetch(`/api/webshop/select-collection-point/1`,{
            headers:httpRequestHeader(false,'client',true)
        })
        if (!resp.ok) {
            if (await sessionLost(resp.status)) return
            const prevAddressID = selectedCollectionPoint.get()
            if (!prevAddressID) {
                const homeDeliveryCheckbox = document.getElementById('delivery') as HTMLInputElement
                if (!!homeDeliveryCheckbox) homeDeliveryCheckbox.checked = false
            }
            else if (prevAddressID !== 1) {
                const clickCollectCheckbox = document.getElementById('collect') as HTMLInputElement
                if (!!clickCollectCheckbox) clickCollectCheckbox.checked = true
            }
            setLoading(false)
            showErrorModal("Sorry, we're unable to offer home delivery due to a system error. Please try again later.")
            return
        }
        selectedCollectionPoint.set(1)
        const {apiResponse} = await resp.json() as {apiResponse:IAddToBagResponse}
        dispatchInternalEvent(ADD_TO_BAG_FROM_CATALOGUE,apiResponse)

        checkboxRef.checked = false
        const homeDeliveryCheckbox = document.getElementById('delivery') as HTMLInputElement
        if (!!homeDeliveryCheckbox) homeDeliveryCheckbox.checked = true
        setLoading(false)
    }

    const popUpModal = (e:InputEvent) => {
        const checkbox = e.target as HTMLInputElement
        if (!checkbox.checked) return

        if (!!problemItemIDs().length) {
            checkbox.checked = false
            checkboxRef.checked = true
            return
        }
        updateCartPerWarehouseStock()
    }

    onMount(()=>{
        const homeDeliveryCheckbox = document.getElementById('delivery') as HTMLInputElement
        homeDeliveryCheckbox.addEventListener('change',popUpModal,true)
        document.addEventListener(UPDATE_CART_ITEM_MAP, wsUpdateCart, true);
        document.addEventListener(PRODUCT_UPDATE, onProductsUpdate, true);
        document.addEventListener(CART_UPDATE,wsUpdateCart, true)

        onCleanup(()=>{
            homeDeliveryCheckbox.removeEventListener('change',popUpModal,true)
            document.removeEventListener(UPDATE_CART_ITEM_MAP, wsUpdateCart, true);
            document.removeEventListener(PRODUCT_UPDATE, onProductsUpdate, true);
            document.removeEventListener(CART_UPDATE,wsUpdateCart, true)
        })
    })

    return (
        <div id='online-stock-issue-modal'>
            <input ref={checkboxRef} type="checkbox" hidden id="online-stock-issue-modal-checkbox" class='peer' />
            <div class='fixed w-screen h-screen top-0 left-0 bg-gray-600 opacity-50 z-50 hidden peer-checked:block' />
            <div class="hidden peer-checked:flex flex-col justify-center z-50 fixed w-screen h-screen top-0 left-0 px-4">
                <div class="max-w-96 bg-white mx-auto p-4 rounded-md">
                    <p class='font-light tracking-wide'>
                        Some items in your basket have limited availability in our warehouse. 
                        We can automatically adjust quantities for you, or you can edit your order manually. 
                        Which would you prefer?
                    </p>
                    <ul>
                        <For 
                            each={problemItemIDs()}
                            children={e=>(<ItemWithIssue id={e} qtyInCart={cartItemMap[e].quantity} pd={productDetailsMap[e]} />)}
                        />
                    </ul>
                    <label 
                        class="mt-4 w-full text-center uppercase font-serif text-sm tracking-widest py-2 border-black border font-semibold block relative after:absolute after:w-full after:h-0 after:bottom-0 after:left-0 after:bg-black after:duration-300 mouse:hover:after:h-0.5 touchscreen:after:hidden"
                        for="online-stock-issue-modal-checkbox"
                    >Edit Order Manually</label>
                    <button onClick={updateCartPerWarehouseStock} class="w-full mt-2 py-2 uppercase font-serif text-sm tracking-widest cursor-pointer text-white bg-gray-600 border border-gray-600 mouse:hover:bg-black mouse:hover:border-black duration-300 font-semibold">Adjust Order as Above</button>
                </div>
            </div>
        </div>
    )
}

export default OnlineStockIssue