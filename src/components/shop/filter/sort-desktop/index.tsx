import { createMemo, For, onCleanup, onMount, useContext } from 'solid-js'
import sortOrder from '../sort-menu-options.json'
import type { ISortOrderItem } from '@misc/interfaces'
import SortItem from './sort-item'
import { FilterMasterContext } from '../context'

const id = "desktop-sort-menu-checkbox"
const containerID = 'desktop-sort-container'

const DesktopSortMenu = () => {
    let checkboxRef

    const { currentURL } = useContext(FilterMasterContext)

    const labelName = createMemo(()=>{
        const searchParams = new URLSearchParams(currentURL.search)
        if (!searchParams.has('sort')) return sortOrder[0].name
        const sortValue = searchParams.get('sort').toLowerCase()
        const matchingItem = sortOrder.find(e=>e.slug === sortValue)
        if (!!matchingItem) return matchingItem.name
        return sortOrder[0].name
    })

    const onMouseLeave = () => {
        if (checkboxRef.checked) checkboxRef.click()
    }

    const onTouchEnd = (ev:TouchEvent) => {
        if (!checkboxRef.checked) return

        const targetElem = ev.changedTouches[0].target as HTMLElement
        if (!targetElem.closest(`#${containerID}`)) {
            ev.preventDefault()
            checkboxRef.click()
        }
    }

    onMount(()=>{
        window.addEventListener('touchend',onTouchEnd)
        onCleanup(()=>{
            window.removeEventListener('touchend',onTouchEnd)
        })
    })

    return (
        <div id={containerID} class="relative w-44" onMouseLeave={onMouseLeave}>
            <input ref={checkboxRef} id={id} type="checkbox" hidden class="peer" />
            <label for={id} class="tracking-widest font-semibold text-xs uppercase cursor-pointer px-2 flex justify-between pt-2 pb-1 peer-checked:[&>svg]:rotate-180">
                <span>{labelName()}</span>
                <svg viewBox="0 0 10 10" class="h-2 w-2 fill-none stroke-black stroke-1 my-auto scale-[1.2] -translate-y-px duration-300">
                    <polyline points="1,3 5,7 9,3" />
                </svg>
            </label>
            <ul class="absolute hidden peer-checked:block bg-white w-full py-1">
                <For 
                    each={sortOrder as ISortOrderItem[]}
                    children={e=><SortItem {...e} />}
                />
            </ul>
        </div>
    )
}

export default DesktopSortMenu