import { children, onCleanup, onMount, useContext, type JSX } from 'solid-js'
import CloseSidebarIcon from "@components/layout/header/icons/close-sidebar-icon"
import { FilterHybridContext, FilterMasterContext } from '../context';

const FilterTablet = (p:{
    children:JSX.Element;
}) => {
    let checkboxRef, contentRef, headerRef, buttonRef, containerRef

    const c = children(()=>p.children)

    const { updateURL, currentURL, pathnamePrefixArr } = useContext(FilterMasterContext)
    const { tempData, clearFilterOnClick } = useContext(FilterHybridContext)

    const backdropOnClick = (ev:Event) => {
        ev.preventDefault()
        if (!!checkboxRef.checked) checkboxRef.click()
    }

    const containerResizeCallback = (entries:ResizeObserverEntry[]) => {
        for (const entry of entries){
            const containerHeight = entry.contentRect.height
            const headerHeight = headerRef.getBoundingClientRect().height
            const buttonContainerHeight = buttonRef.getBoundingClientRect().height
            contentRef.style.height = `${containerHeight - headerHeight - buttonContainerHeight}px`
        }
    }

    const showResultOnClick = async () => {
        const success = await updateURL([...pathnamePrefixArr,...tempData.slugsSelected].join('/')+currentURL.search,'')
        if (success) checkboxRef.checked = false
    }

    onMount(()=>{
        const resizeObserver = new ResizeObserver(containerResizeCallback)
        resizeObserver.observe(containerRef)
        onCleanup(()=>{
            resizeObserver.disconnect()
        })
    })

    return (
        <div class="hidden xs:block md:hidden">
            <input ref={checkboxRef} type="checkbox" class="peer" hidden id="filter-tablet-checkbox" />
            <div onClick={backdropOnClick} class="hidden peer-checked:block fixed left-0 top-0 w-full h-full z-30 opacity-10 bg-black" />
            <div ref={containerRef} class="fixed right-full top-0 w-full h-full max-w-80 bg-white z-40 peer-checked:translate-x-full transition-all duration-300">
                <div ref={headerRef} class="flex justify-between">
                    <div style="width:calc(2.5em + 1rem)" />
                    <div class="flex flex-col justify-center">
                        <p class="uppercase tracking-widest text-sm font-semibold">Filter</p>
                    </div>
                    <label for="filter-tablet-checkbox" class="cursor-pointer p-2">
                        <CloseSidebarIcon />
                    </label>
                </div>
                <div ref={contentRef} class="overflow-y-scroll hide-scrollbar px-4">
                    <div class="border-y border-gray-300 divide-y divide-gray-300">{c()}</div>
                </div>
                <div ref={buttonRef} class="flex p-2 gap-2 absolute bottom-0 left-0 w-full text-xs">
                <button onClick={showResultOnClick} class="flex-1 font-serif tracking-widest font-semibold text-center border-gray-600 border py-2 bg-gray-600 text-white mouse:hover:bg-black mouse:hover:border-black duration-300 cursor-pointer">Show {tempData.productCount} Items</button>
                <button onClick={clearFilterOnClick} class="flex-none tracking-widest text-2xs uppercase relative after:absolute after:w-full after:h-0 after:bg-black after:left-0 after:bottom-2.5 mouse:hover:after:h-px touchscreen:after:hidden">Clear Filter</button>
                </div>
            </div>
        </div>
    )
}

export default FilterTablet