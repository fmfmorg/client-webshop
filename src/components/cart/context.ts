import { createContext } from 'solid-js'
import type { ICatalogueMap } from "@misc";
import type { ICartItemMap } from "./interfaces";

interface IContext {
    cartItemMap:ICartItemMap;
    prodDetailsMap:ICatalogueMap;
}

export const CartContext = createContext<IContext>()