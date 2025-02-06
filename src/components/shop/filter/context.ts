import type { IFilterFacetCountMap, IPathnameSlugOrderItem, IUrl } from '@misc/interfaces';
import { createContext } from 'solid-js'
import type { IFilterHybridTempData, IFilterRenderItem } from './interfaces';

export const FilterMasterContext = createContext<{
    filterAttributes:{[d:string]:string[]};
    mainProductType:string;
    currentURL:IUrl;
    updateURL:(s:string,slug:string)=>Promise<boolean>;
    facetCountMap: IFilterFacetCountMap;
    pathnamePrefixArr:string[];
    updateLoading:(v:boolean)=>void;
    bottomSheetFilterCheckboxID:string;
}>({
    filterAttributes:{},
    mainProductType:'',
    currentURL:{pathname:'',search:'',slugOrder:[]},
    updateURL:async()=>false,
    facetCountMap: {},
    pathnamePrefixArr:[],
    updateLoading:()=>{},
    bottomSheetFilterCheckboxID:'',
})

export const FilterSubContext = createContext<{
    slugOrder:IPathnameSlugOrderItem[];
    filterRenderAttr:IFilterRenderItem[];
}>({
    slugOrder:[],
    filterRenderAttr:[],
})

export const FilterHybridContext = createContext<{
    tempData:IFilterHybridTempData;
    optionOnClick:(slug:string)=>void;
    tempFacetCountMap:IFilterFacetCountMap;
    clearFilterOnClick:()=>void;
}>({
    tempData:{
        slugsSelected:[],
        productCount:0,
    },
    optionOnClick:()=>{},
    tempFacetCountMap:{},
    clearFilterOnClick:()=>{},
})