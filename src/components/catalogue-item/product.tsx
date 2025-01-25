import { createMemo, Show, Index, useContext, createSignal } from 'solid-js'
import ShoppingBag from '@components/layout/header/icons/shopping-bag';
import LoadingSmall from '@components/layout/header/icons/loading-small';
import { formatPrice } from '@misc';
import Image from './image';
import CatalogueItemContext from './context';

const DesktopSwapImageBtns = (p:{
    desktopImageLeftward:(e:Event)=>void;
    desktopImageRightward:(e:Event)=>void;
}) => (
    <>
        <button onClick={p.desktopImageLeftward} aria-label="Previous Image" class='leftward absolute top-0 h-full left-0 w-2/12 duration-500 transition-all bg-gradient-to-r from-gray-400 to-transparent opacity-0 peer/left mouse:hover:opacity-10' />
        <svg viewBox="0 0 70 100" height="1em" stroke-width="0.8rem" stroke-linecap="round" fill="none" class='absolute left-2 stroke-gray-700 opacity-0 duration-500 mouse:group-hover:opacity-30 peer-hover/left:opacity-100 pointer-events-none' style="top:calc(50% - 0.5em)">
            <polyline points="65,5 20,50 65,95" />
        </svg>
        <button onClick={p.desktopImageRightward} aria-label="Next Image" class='rightward absolute top-0 h-full right-0 w-2/12 duration-500 transition-all bg-gradient-to-l from-gray-400 to-transparent opacity-0 peer/right mouse:hover:opacity-10' />
        <svg viewBox="0 0 70 100" height="1em" stroke-width="0.8rem" stroke-linecap="round" fill="none" class='absolute right-2 stroke-gray-700 opacity-0 duration-500 mouse:group-hover:opacity-30 peer-hover/right:opacity-100 pointer-events-none' style="top:calc(50% - 0.5em)">
            <polyline points="5,5 50,50 5,95" />
        </svg>
    </>
)

const Product = (p:{
    id:string;
    renderImages:boolean;
    addToBag:(e:Event)=>void;
    loading:boolean;
    isProductPage:boolean;
    showBuyBtn:boolean;
}) => {
    const { productMap } = useContext(CatalogueItemContext)
    const [touchStartX,setTouchStartX] = createSignal(0)
    const [touchStartY,setTouchStartY] = createSignal(0)
    const finalImages = createMemo(()=>productMap[p.id].images.filter(e=>!!e.catalogue))
    const finalImagesLen = createMemo(()=>finalImages().length)
    const name = createMemo(()=>productMap[p.id].name)
    const price = createMemo(()=>productMap[p.id].price)
    const discountedPrice = createMemo(()=>productMap[p.id].discountedPrice)
    const withNoDiscount = createMemo(()=>price() === discountedPrice())

    const [currentImage,setCurrentImage] = createSignal(0)

    const imageLeftward = () => setCurrentImage(prev=>!!prev ? prev - 1 : finalImagesLen() - 1)
    const imageRightward = () => setCurrentImage(prev=>prev < finalImagesLen() - 1 ? prev + 1 : 0)

    const desktopImageLeftward = (e:Event) => {
        e.preventDefault()
        imageLeftward()
    }

    const desktopImageRightward = (e:Event) => {
        e.preventDefault()
        imageRightward()
    }

    const onMouseLeave = () => {
        if (finalImagesLen() === 1) return

        if (!!currentImage()) setCurrentImage(0)
    }

    const onTouchStart = (e:TouchEvent) => {
        if (finalImagesLen() === 1) return

        const {clientX, clientY} = e.changedTouches[0]
        setTouchStartX(clientX)
        setTouchStartY(clientY)
    }

    const onTouchEnd = (e:TouchEvent) => {
        if (finalImagesLen() === 1) return

        const {clientX, clientY} = e.changedTouches[0]
        const deltaX = Math.abs(clientX - touchStartX())
        const deltaY = Math.abs(clientY - touchStartY())

        if (deltaX > deltaY) {
            if (clientX > touchStartX()) imageLeftward()
            else imageRightward()
        }
    }

    return (
        <div class="relative bg-white rounded-lg mouse:hover:shadow-gray-200 mouse:hover:shadow-lg mouse:hover:p-4 mouse:hover:m-[-1rem] transition-all mouse:hover:z-10 duration-300 group" onMouseLeave={onMouseLeave}>
            <div 
                id={`catalogue-product-container-${p.id}`} 
                class="w-full relative aspect-square mouse:overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <Index
                    each={finalImages()}
                    children={(_,i)=><Image {...{
                        ...p,
                        index:i,
                        checked:currentImage() === i,
                        productPageKeyProduct:false,
                        render:p.renderImages,
                        isProductPage:p.isProductPage,
                    }} />}
                />
                <div class="touchscreen:hidden">
                    <Show
                        when={finalImagesLen() > 1}
                        children={<DesktopSwapImageBtns {...{desktopImageLeftward,desktopImageRightward}} />}
                    />
                    <Show 
                        when={p.showBuyBtn}
                        children={
                            <div id={`catalogue-add-to-bag-${p.id}`} class={`add-to-bag-mouse flex justify-center absolute w-full bottom-0 translate-y-full duration-500 mouse:group-hover:-translate-y-5`}>
                                <button onClick={p.addToBag} aria-label="Add to Bag" class="rounded-full p-2 xs:p-2.5 sm:p-3 shadow-lg bg-white mouse:hover:shadow-gray-300">
                                    <Show 
                                        when={p.loading}
                                        children={<LoadingSmall className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 stroke-[0.2rem] fill-gray-500 animate-spin" />}
                                        fallback={<ShoppingBag className="shopping-bag-icon h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 stroke-[0.2rem] stroke-black fill-none" />}
                                    />
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>
            <p class="uppercase mt-1 xs:mt-2 text-gray-500 tracking-widest font-light text-2xs sm:text-xs">{name()}</p>
            <Show 
                when={withNoDiscount()} 
                fallback={
                    <p class="font-serif">
                        <span class="text-red-700 mr-1 xs:mr-2 line-through tracking-tight text-2xs xs:text-xs md:text-sm lg:text-base">{formatPrice(price())}</span>
                        <span class="font-black tracking-widest text-xs xs:text-sm md:text-base lg:text-lg">{formatPrice(discountedPrice())}</span>
                    </p>
                }
                children={
                    <p class="font-serif font-black tracking-widest text-xs xs:text-sm md:text-base lg:text-lg">{formatPrice(price())}</p>
                }
            />
        </div>
    )
}

export default Product