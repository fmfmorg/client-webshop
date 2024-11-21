import { createMemo, Show, useContext } from 'solid-js'
import Image from "@components/cart/image";
import { formatPrice } from '@misc';
import { CartContext } from './context';
import { useStore } from '@nanostores/solid';
import { selectedCollectionPoint, shopNameMap } from '@stores';

const LowStockReminder = (p:{productID:string;}) => {
    const { prodDetailsMap } = useContext(CartContext)
    const $shopNameMap = useStore(shopNameMap)
    const $selectedCollectionPoint = useStore(selectedCollectionPoint)
    const shopName = createMemo(()=>$selectedCollectionPoint() > 1 ? `${$shopNameMap()[$selectedCollectionPoint()]} store` : 'stock')
    const stockQty = createMemo(()=>{
        const _selectedCollectionPoint = $selectedCollectionPoint()
        const _productDetail = prodDetailsMap[p.productID]
        if (!_selectedCollectionPoint) return Math.max(..._productDetail.stockQuantities.map(e=>e.quantity))
        else return _productDetail.stockQuantities.find(e=>e.address === _selectedCollectionPoint)?.quantity || 0
    })
    return (
        <p class='text-red-700 text-xs xs:text-sm italic mt-2'>Only {stockQty()} left in {shopName()}.</p>
    )
}

const CartItem = (
    p:{
        id:string;
        onMinus:()=>void;
        onPlus:()=>void;
        onInputChange:(v:number)=>void;
        deleteOnClick:()=>void;
    }
) => {
    let ref

    const { cartItemMap, prodDetailsMap } = useContext(CartContext)

    const onSubmit = (e:SubmitEvent) => {
        e.preventDefault();
        ref.blur()
    }
    const onBlur = () => p.onInputChange(+ref.value)

    const productDetail = createMemo(()=>prodDetailsMap[p.id])
    const qtyInCart = createMemo(()=>cartItemMap[p.id]?.quantity || 0)

    const maxStockQty = createMemo(()=>Math.max(...productDetail().stockQuantities.map(e=>e.quantity)))

    const $selectedCollectionPoint = useStore(selectedCollectionPoint)

    const showLowStockReminder = createMemo(()=>{
        const _selectedCollectionPoint = $selectedCollectionPoint()
        const _productDetail = productDetail()
        const _qtyInCart = qtyInCart()
        if (!_selectedCollectionPoint) return maxStockQty() - _qtyInCart <= 3
        else {
            const stockInWH = _productDetail.stockQuantities.find(e=>e.address === _selectedCollectionPoint)?.quantity || 0
            return stockInWH - _qtyInCart <= 3
        }
    })
    
    return (
        <div class="grid grid-cols-3 grid-flow-dense relative" data-id={p.id}>
            <a href={`/product/${productDetail().url}/${p.id}`} class="col-span-1 p-2">
                <Image name={productDetail().images[0].name} ext={productDetail().images[0].ext} />
            </a>
            <div class="col-span-2 py-2 pr-1">
                <div class='flex w-full justify-between'>
                    <a href={`/product/${productDetail().url}/${p.id}`} class="font-serif">{productDetail().name}</a>
                    <div class='relative h-full -mt-1'>
                        <button class="p-2 absolute top-0 right-0" onClick={p.deleteOnClick}>
                            <svg viewBox="0 0 100 100" height="1em" stroke-linecap="round" stroke="black" stroke-width='0.4rem'>
                                <line x1="20" y1="20" x2="80" y2="80" />
                                <line x1="20" y1="80" x2="80" y2="20" />
                            </svg>
                        </button>
                    </div>
                </div>
                {
                    productDetail().price === productDetail().discountedPrice ?
                    <p class="mt-1 font-serif font-black tracking-widest text-xs xs:text-sm md:text-base lg:text-lg">{formatPrice(productDetail().price)}</p> :
                    <p class="mt-1 font-serif">
                        <span class="text-red-700 mr-1 xs:mr-2 line-through tracking-tight text-2xs xs:text-xs md:text-sm lg:text-base">{formatPrice(productDetail().price)}</span>
                        <span class="font-black tracking-widest text-xs xs:text-sm md:text-base lg:text-lg">{formatPrice(productDetail().discountedPrice)}</span>
                    </p>
                }
                <div class="mt-2 flex w-full justify-between">
                    <form class="flex" id={`sidebar-cart-${p.id}`} onSubmit={onSubmit}>
                        <div onClick={p.onMinus} class="cursor-pointer p-3 w-9 h-9 flex-none text-3xl font-light bg-white border border-gray-600">
                            <svg viewBox="0 0 100 100" class="w-full h-full" stroke="black" stroke-width="0.4em">
                                <line x1="5" y1="50" x2="95" y2="50" />
                            </svg>
                        </div>
                        <input id={`cart-item-${p.id}`} ref={ref} onBlur={onBlur} type="number" step="1" min="0" max={maxStockQty()} value={qtyInCart()} class="text-center w-12 border-y rounded-none border-black outline-none" />
                        <div onClick={p.onPlus} class="cursor-pointer p-3 w-9 h-9 flex-none text-3xl font-light bg-white border border-gray-600">
                            <svg viewBox="0 0 100 100" class="w-full h-full" stroke="black" stroke-width="0.4em">
                                <line x1="5" y1="50" x2="95" y2="50" />
                                <line x1="50" y1="5" x2="50" y2="95" />
                            </svg>
                        </div>
                        <input type="submit" value="submit" hidden />
                    </form>
                </div>
                <Show 
                    when={showLowStockReminder()}
                    children={<LowStockReminder productID={p.id} />}
                />
            </div>
            <div class='absolute w-full h-full top-0 left-0 hidden' id={`cart-item-${p.id}-loading-spinner`}>
                <div class='absolute w-full h-full top-0 left-0 backdrop-blur-sm' />
                <div class='absolute w-full h-full top-0 left-0 bg-white opacity-40' />
                <div class='absolute w-full h-full top-0 left-0 flex flex-col justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" class='h-12 w-12 m-auto fill-gray-500 animate-spin'>
                        <use href='#loading-small' />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default CartItem