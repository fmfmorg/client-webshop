import { createMemo, createSignal, For, onCleanup, onMount, useContext } from 'solid-js'
import {FilterMasterContext, FilterSubContext} from './context'
import DesktopFilterHeader from './desktop-filter-header'
import DesktopAttributeContainer from './attribute-desktop'
import type { IPathnameSlugOrderItem } from '@misc/interfaces'
import Breadcrumb from './breadcrumb'
import { useStore } from '@nanostores/solid'
import { headerScrollLimit } from '@stores'
import ChipsContainer from './chips'
import DesktopSortMenu from './sort-desktop'
import { FilterHybrid, SortHybridWrapper } from './filter-hybrid'

const filterHeaderContainerID = 'filter-header-container'
const desktopFilterContainerID = 'desktop-filter-container'

const Filter = (p:{loading:boolean;productCount:number;}) => {
    let 
        resizeTimeout, 
        containerRef, 
        desktopFilterContainer,
        chipsContainer

    const { filterAttributes, mainProductType } = useContext(FilterMasterContext)
        
    const [lastScrollY,setLastScrollY] = createSignal(0)
    const _headerScrollLimit = useStore(headerScrollLimit)

    const headerNameMap = createMemo(()=>{
        const map = new Map<string,string>()
        switch (mainProductType) {
            case 'earrings':
                map.set('subType','category')
                map.set('metalColor','colour')
                break
            default: break
        }
        return map
    })

    const attrOrder = createMemo(()=>{
        let arr:string[] = []
        switch (mainProductType) {
            case 'earrings':
                arr = ['subType','metalColor','material']
                break
            default: break
        }
        
        return arr
    })

    const filterRenderAttr = createMemo(()=>attrOrder().map(e=>({
        attrName:e,
        headerName:headerNameMap().get(e) || e,
        desktopRadioInput:`desktop-filter-attribute-${e.toLowerCase()}`,
        desktopHeaderLabelID:`desktop-filter-attribute-${e.toLowerCase()}-label`,
        desktopULID:`desktop-filter-attribute-${e.toLowerCase()}-ul`,
        tabletHeaderLabelID:`tablet-filter-attribute-${e.toLowerCase()}`,
        mobileRadioInput:`mobile-filter-attribute-${e.toLowerCase()}`,
        mobileHeaderLabelID:`mobile-filter-attribute-${e.toLowerCase()}-label`,
        attributes:filterAttributes[e],
    })))

    const slugOrder = createMemo<IPathnameSlugOrderItem[]>(()=>attrOrder().map((attr,attrIndex)=>filterAttributes[attr].map((slug,slugIndex)=>({slug,attr,index:attrIndex * 100 + slugIndex + 1}))).flat().sort((a,b)=>a.index - b.index))

    const hideDesktopFilter = () => {
        const radioInput = document.querySelector('input[name="desktop-filter-attr"]:checked') as HTMLInputElement
        if (!!radioInput) radioInput.checked = false
    }

    const onTouchEnd = (ev:TouchEvent) => {
        const targetElem = ev.changedTouches[0].target as HTMLElement
        const radioInput = document.querySelector('input[name="desktop-filter-attr"]:checked') as HTMLInputElement
        if (!targetElem.closest(`#${filterHeaderContainerID}`) && !targetElem.closest(`#${desktopFilterContainerID}`) && !!radioInput) {
            ev.preventDefault()
            radioInput.checked = false
        }
    }

    const onMouseLeave = (ev:MouseEvent) => {
        const isDesktop = window.matchMedia && matchMedia('(pointer:fine)').matches
        if (!isDesktop) return

        const relatedTargetElem = ev.relatedTarget as HTMLElement
        if (!relatedTargetElem || !relatedTargetElem.closest(`#${filterHeaderContainerID}`) && !relatedTargetElem.closest(`#${desktopFilterContainerID}`)) hideDesktopFilter()
    }

    const onLoad = () => {
        const { bottom: _containerBottom } = containerRef.getBoundingClientRect()
        desktopFilterContainer.style.top = `${_containerBottom}px`
    }

    onMount(()=>{
        // show filter on scroll down
        setLastScrollY(window.scrollY)

        const header = document.getElementsByTagName('header')[0] as HTMLElement

        const scrolling = (isDown:boolean) => {
            const { height: containerHeight, bottom: containerBottom } = containerRef.getBoundingClientRect()
            const { height: headerHeight } = header.getBoundingClientRect()
            if (isDown) {
                containerRef.style.top = `${headerHeight}px`
                chipsContainer.style.top = `${Math.max(containerBottom, headerHeight + containerHeight)}px`
            } else {
                const { height: chipContainerHeight } = chipsContainer.getBoundingClientRect()
                containerRef.style.top = `-${containerHeight}px`
                chipsContainer.style.top = `-${chipContainerHeight}px`
                hideDesktopFilter()
            }
        }

        scrolling(false)
        
        const onScroll = () => {
            if (Math.abs(window.scrollY - lastScrollY()) > _headerScrollLimit()){
                scrolling(window.scrollY < lastScrollY())
            }
            setLastScrollY(window.scrollY)

            const { height: containerHeight, bottom: containerBottom } = containerRef.getBoundingClientRect()
            const { height: headerHeight } = header.getBoundingClientRect()
            desktopFilterContainer.style.top = `${Math.max(containerBottom, headerHeight + containerHeight)}px`
        }

        window.addEventListener('scroll',onScroll,true)

        // adjust column position in desktop filter
        const repositionColumns = () => {
            const len = filterRenderAttr().length
    
            for (let i=0; i<len; i++){
                const {desktopULID,desktopHeaderLabelID} = filterRenderAttr()[i]
                const label = document.getElementById(desktopHeaderLabelID) as HTMLLabelElement
                const ul = document.getElementById(desktopULID) as HTMLUListElement
                if (!label || !ul) continue
    
                const { left } = label.getBoundingClientRect()
                ul.style.left = `${left}px`
            }

            const desktopRadioInput = document.querySelector('input[name="desktop-filter-attr"]:checked') as HTMLInputElement
            if (!!desktopRadioInput && window.innerWidth < 768) desktopRadioInput.checked = false
        }
    
        const attrHeaderMutationCallback = (mutationList:MutationRecord[],_) => {
            for (const mutation of mutationList){
                if (mutation.type === 'attributes') repositionColumns()
            }
        }
    
        const onResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(()=>{
                onLoad()
                repositionColumns()
            },100)
        }

        setTimeout(onLoad,100)
        setTimeout(repositionColumns,100)
        
        const attrHeaderObserver = new MutationObserver(attrHeaderMutationCallback)
        filterRenderAttr().forEach(({desktopHeaderLabelID})=>{
            const label = document.getElementById(desktopHeaderLabelID) as HTMLLabelElement
            attrHeaderObserver.observe(label,{attributes:true})
        })

        window.addEventListener('resize',onResize,true)
        window.addEventListener('touchend',onTouchEnd,true)

        onCleanup(()=>{
            window.removeEventListener('scroll',onScroll,true)
            attrHeaderObserver.disconnect()
            window.removeEventListener('resize',onResize,true)
            window.removeEventListener('touchend',onTouchEnd,true)
        })
    })

    return (
        <FilterSubContext.Provider 
            value={{
                slugOrder:slugOrder(),
                filterRenderAttr:filterRenderAttr(),
            }} 
            children={
                <>
                <div class="hidden md:[&:has(.filterattr:checked)]:block">
                    <div id={desktopFilterContainerID} ref={desktopFilterContainer} onMouseLeave={onMouseLeave} class="z-[17] fixed w-screen bg-white h-32">
                        <For 
                            each={filterRenderAttr()}
                            children={e=>(<DesktopAttributeContainer {...e} />)}
                        />
                        <div class={`absolute top-0 left-0 w-full h-full bg-white opacity-10 ${p.loading ? '' : 'hidden'}`.trim()} />
                    </div>
                    <div class="fixed z-[15] top-0 left-0 w-full h-full opacity-10 bg-black" />
                </div>
                <Breadcrumb />
                <div ref={containerRef} id={filterHeaderContainerID} onMouseLeave={onMouseLeave} class="hidden xs:grid xs:grid-cols-2 xs:gap-4 md:flex bg-white md:justify-between p-2 md:px-4 md:py-0 w-full mb-1 z-20 sticky transition-all duration-300">
                    <div class="hidden md:flex gap-x-6 [&>*]:pt-2 [&>*]:pb-1">
                        <p class="text-gray-400 tracking-widest font-normal text-xs uppercase">Filter by:</p>
                        <For 
                            each={filterRenderAttr()}
                            children={e=>(
                                <DesktopFilterHeader {...e} />
                            )}
                        />
                    </div>
                    <div class="hidden md:flex gap-x-4">
                        <p class="text-gray-400 tracking-widest font-normal text-xs uppercase pt-2 pb-1">Sort by:</p>
                        <DesktopSortMenu />
                    </div>
                    <label for="filter-tablet-checkbox" class="hidden xs:flex xs:justify-center md:hidden text-center border border-black text-xs uppercase tracking-widest py-1 cursor-pointer">
                        <span>Filter</span>
                        <svg viewBox="0 0 20 20" class="ml-2 my-auto w-4 h-4 stroke-1 stroke-black fill-none" stroke-linecap="round">
                            <line x1="0" y1="4" x2="20" y2="4" />
                            <line x1="4" y1="10" x2="16" y2="10" />
                            <line x1="8" y1="16" x2="12" y2="16" />
                        </svg>
                    </label>
                    <SortHybridWrapper 
                        children={<>
                        <span>Sort</span>
                        <svg viewBox="0 0 20 20" class="ml-2 my-auto w-4 h-4 stroke-1 stroke-black fill-none" stroke-linecap="round">
                            <defs>
                                <g id="sort-arrow">
                                    <polyline points="6,9 10,5 14,9" />
                                    <line x1="10" y1="5" x2="10" y2="15" />
                                </g>
                            </defs>
                            <use href="#sort-arrow" x="-3" y="-3" />
                            <g transform="translate(18,18) rotate(180)">
                                <use href="#sort-arrow" x="-7" y="-5" />
                            </g>
                        </svg>
                        </>}
                        labelClassName='hidden xs:flex xs:justify-center md:hidden text-center border border-black text-xs uppercase tracking-widest py-1 cursor-pointer'
                        containerClassName='relative hidden xs:block md:hidden'
                    />
                </div>
                <div ref={chipsContainer} class="hidden md:block bg-white sticky duration-300 z-[15] transition-all duration-300 px-4 pt-2">
                    <ChipsContainer />
                </div>
                <FilterHybrid productCount={p.productCount} />
                </>
            }
        />
    )
}

export default Filter