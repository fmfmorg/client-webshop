import type { IFilterFacetCountMap, IPathnameSlugOrderItem, IUrl } from '@misc/interfaces';
import { createContext } from 'solid-js'

export const FilterMasterContext = createContext<{
    filterAttributes:{[d:string]:string[]};
    mainProductType:string;
    currentURL:IUrl;
    updateURL:(s:string,slug:string)=>void;
    facetCountMap: IFilterFacetCountMap;
    pathnamePrefixArr:string[];
}>({
    filterAttributes:{},
    mainProductType:'',
    currentURL:{pathname:'',search:'',slugOrder:[]},
    updateURL:()=>{},
    facetCountMap: {},
    pathnamePrefixArr:[],
})

export const FilterSubContext = createContext<{
    slugOrder:IPathnameSlugOrderItem[];
}>({
    slugOrder:[],
})