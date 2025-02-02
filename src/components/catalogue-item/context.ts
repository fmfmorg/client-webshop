import { createContext } from 'solid-js'
import type { ICartItemMap } from "@components/cart/interfaces";
import type { ICatalogueMap } from "@misc";
import type { IProductIdOrderMap } from './interfaces';

const CatalogueItemContext = createContext<{
    productMap:ICatalogueMap;
    cartItemMap:ICartItemMap;
    productIdOrderMap:IProductIdOrderMap;
    observerCallback:(entries: IntersectionObserverEntry[], observer: IntersectionObserver)=>void;
}>({
    productMap:{},
    cartItemMap:{},
    productIdOrderMap:{},
    observerCallback:()=>{},

})

export default CatalogueItemContext