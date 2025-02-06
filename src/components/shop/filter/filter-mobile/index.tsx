import { createSignal, useContext, For } from 'solid-js'
import { FilterHybridContext, FilterMasterContext, FilterSubContext } from '../context'
import { bottomSheetScrollLimit, headerScrollLimit } from '@stores'
import { useStore } from '@nanostores/solid'
import FilterMobileAttributeHeader from './attribute-header'
import AttributeContainer from './attribute-container'

const FilterMobile = () => {
    let checkboxRef, filterContainerRef
    const { bottomSheetFilterCheckboxID, updateURL, pathnamePrefixArr, currentURL } = useContext(FilterMasterContext)
    const { tempData, clearFilterOnClick } = useContext(FilterHybridContext)
    const { filterRenderAttr } = useContext(FilterSubContext)
    const [attrSelected, setAttrSelected] = createSignal(filterRenderAttr[0].attrName)
    const _bottomSheetScrollLimit = useStore(bottomSheetScrollLimit)
    const _headerScrollLimit = useStore(headerScrollLimit)
    const [touchStartY,setTouchStartY] = createSignal(0)
    const backdropOnClick = () => {
        if (!!checkboxRef.checked) checkboxRef.click();
        setTouchStartY(0)
    }
    const checkboxOnClick = (ev:Event) => {
        const lock = (ev.target as HTMLInputElement).checked
        const htmlTag = document.querySelector('html')
        htmlTag.classList.toggle('overflow-hidden',lock)
        document.body.classList.toggle('overflow-hidden',lock)
    }
    const onTouchStart = (ev:TouchEvent) => setTouchStartY(ev.changedTouches[0].clientY)
    const onTouchMove = (ev:TouchEvent) => {
        const { clientY } = ev.changedTouches[0]
        filterContainerRef.style.transform = `translateY(${Math.max(0,clientY - touchStartY())}px)`
        if (clientY < touchStartY()) setTouchStartY(clientY)
    }
    const onTouchEnd = (ev:TouchEvent) => {
        const { clientY } = ev.changedTouches[0]
        if (clientY > touchStartY() + _headerScrollLimit()){
            ev.preventDefault()
            filterContainerRef.style.transform = null
            if (clientY > touchStartY() + _bottomSheetScrollLimit()) checkboxRef.click()
        }
        setTouchStartY(0)
    }
    const onTouchCancel = () => {
        setTouchStartY(0)
        filterContainerRef.style.transform = null
    }
    const updateAttr = (s:string) => setAttrSelected(s)

    const showResultOnClick = async () => {
        const success = await updateURL([...pathnamePrefixArr,...tempData.slugsSelected].join('/')+currentURL.search,'')
        if (success && checkboxRef.checked) checkboxRef.click()
    }

    return (
        <div class='xs:hidden'>
            <input onClick={checkboxOnClick} ref={checkboxRef} checked type="checkbox" id={bottomSheetFilterCheckboxID} hidden class="peer" />
            <div onClick={backdropOnClick} class="hidden fixed w-full h-full top-0 left-0 bg-black opacity-10 z-30 peer-checked:block" />
            <div 
                ref={filterContainerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
                class="fixed w-full h-fit max-h-[70svh] bg-white left-0 bottom-0 z-40 translate-y-full peer-checked:translate-y-0" 
                classList={{
                    'duration-300':!touchStartY(),
                }}
            >
                <ul class='flex overflow-x-scroll hide-scrollbar'>
                    <For 
                        each={filterRenderAttr}
                        children={e=>(<FilterMobileAttributeHeader {...{...e,attrSelected:attrSelected(),updateAttr}} />)}
                    />
                    <li class="border-b flex-1 border-gray-300" />
                </ul>
                <div>
                    <For 
                        each={filterRenderAttr}
                        children={e=><AttributeContainer {...{...e,hidden:e.attrName !== attrSelected()}} />}
                    />
                </div>
                <div class="flex gap-2 w-full text-xs">
                    <button onClick={clearFilterOnClick} class="flex-none ml-2 tracking-widest text-2xs uppercase relative after:absolute after:w-full after:bg-black after:left-0 after:bottom-2.5 after:h-px mouse:hover:after:h-0">Clear Filter</button>
                    <button onClick={showResultOnClick} class="flex-1 font-serif tracking-widest font-semibold text-center border-gray-600 border py-2 bg-gray-600 text-white mouse:hover:bg-black mouse:hover:border-black duration-300 cursor-pointer">Show {tempData.productCount} Items</button>
                </div>
            </div>
        </div>
    )
}

export default FilterMobile