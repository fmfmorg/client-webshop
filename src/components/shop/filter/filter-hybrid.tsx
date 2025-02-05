import { useContext, For, createEffect, children, type JSX, createMemo } from 'solid-js'
import FilterTablet from "./filter-tablet"
import { FilterHybridContext, FilterMasterContext, FilterSubContext } from './context'
import AttributeTablet from './filter-tablet/attribute'
import { createStore, produce } from 'solid-js/store'
import type { IFilterHybridTempData } from './interfaces'
import { httpRequestHeader, sessionLost } from '@misc'
import type { IFilterFacetCountMap } from '@misc/interfaces'
import sortOrder from './sort-menu-options.json'

const FilterHybrid = (p:{productCount:number;}) => {
    const { currentURL, pathnamePrefixArr, updateLoading, facetCountMap } = useContext(FilterMasterContext)
    const { filterRenderAttr } = useContext(FilterSubContext)

    const [tempData,setTempData] = createStore<IFilterHybridTempData>({
        slugsSelected:currentURL.slugOrder,
        productCount:p.productCount,
    })
    const [tempFacetCountMap, setTempFacetCountMap] = createStore<IFilterFacetCountMap>(facetCountMap)

    const tempDataOnUpdate = async (slugs:string[]) => {
        updateLoading(true)

        const resp = await fetch('/api/webshop/filter-temp-count',{
            method:"POST",
            headers:httpRequestHeader(false,'client',true),
            body:JSON.stringify({
                slugs:[...pathnamePrefixArr,...slugs]
            })
        })

        if (!resp.ok){
            await sessionLost(resp.status)
            updateLoading(false)
            return
        }

        const { apiResponse:{ facetCountMap:_facetCountMap, productCount:_productCount, correctSlugArr} } = await resp.json() as {apiResponse: {
            facetCountMap:IFilterFacetCountMap;
            productCount:number;
            correctSlugArr:string[];
        }}

        setTempFacetCountMap(produce(curr=>{
            const newKeys = Object.keys(_facetCountMap)
            const keysToDelete = !!newKeys.length ? Object.keys(curr).filter(e=>!newKeys.includes(e)) : Object.keys(curr)

            if (!!newKeys.length){
                Object.entries(_facetCountMap).forEach(([k,v])=>{
                    curr[k] = v
                })
            }

            if (!!keysToDelete.length) keysToDelete.forEach(e=>{
                curr[e] = undefined
            })
        }))

        setTempData(produce(e=>{
            e.slugsSelected = correctSlugArr.filter(d=>!pathnamePrefixArr.includes(d))
            e.productCount = _productCount
        }));

        updateLoading(false)
    }

    const optionOnClick = (slug:string) => tempDataOnUpdate(tempData.slugsSelected.includes(slug) ? tempData.slugsSelected.filter(d=>d!==slug) : [...tempData.slugsSelected,slug])

    const clearFilterOnClick = () => tempDataOnUpdate([])

    createEffect(()=>{
        setTempData(produce(e=>{
            e.slugsSelected = [...currentURL.slugOrder]
        }))
    })

    createEffect(()=>{
        setTempData(produce(e=>{
            e.productCount = p.productCount
        }))
    })

    return (
        <FilterHybridContext.Provider 
            value={{
                tempData,
                optionOnClick,
                tempFacetCountMap,
                clearFilterOnClick,
            }}
            children={
                <>
                <FilterTablet 
                    children={
                        <For 
                            each={filterRenderAttr}
                            children={e=>(<AttributeTablet {...e} />)}
                        />
                    }
                />
                </>
            }
        />
    )
}

const SortHybridWrapper = (p:{
    children:JSX.Element;
    labelClassName:string;
    containerClassName:string;
}) => {
    let selectRef
    const c = children(()=>p.children)
    const { updateURL, currentURL } = useContext(FilterMasterContext)
    const currentSlug = createMemo(()=>{
        const searchParams = new URLSearchParams(currentURL.search)
        if (!searchParams.has('sort')) return sortOrder[0].slug
        const sortValue = searchParams.get('sort').toLowerCase()
        const matchingItem = sortOrder.find(e=>e.slug === sortValue)
        if (!!matchingItem) return matchingItem.slug
        return sortOrder[0].slug
    })

    const onInput = (ev:Event) => {
        ev.preventDefault()
        const newSearchParams = new URLSearchParams(currentURL.search)
        newSearchParams.set('sort',(ev.target as HTMLSelectElement).value)
        updateURL(`${currentURL.pathname}?${newSearchParams.toString()}`,"")
    }

    return (
        <div class={p.containerClassName}>
            <select onInput={onInput} ref={selectRef} class="absolute top-0 w-full h-full opacity-0">
                <For 
                    each={sortOrder}
                    children={e=>(
                        <option value={e.slug} selected={currentSlug() === e.slug}>{e.name}</option>
                    )}
                />
            </select>
            <label class={p.labelClassName}>
                {c()}
            </label>
        </div>
    )
}

export { FilterHybrid, SortHybridWrapper }