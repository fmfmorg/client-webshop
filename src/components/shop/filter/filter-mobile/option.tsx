import { createMemo, useContext } from "solid-js"
import { FilterHybridContext } from "../context"
import { capitalizeEveryWord } from "@misc"

const FilterMobileAttributeOption = (p:{
    attr:string
}) => {
    let checkboxRef

    const { tempData, optionOnClick, tempFacetCountMap } = useContext(FilterHybridContext)
    const count = createMemo(()=>tempFacetCountMap[p.attr] || 0)
    const checkboxID = createMemo(()=>`filter-mobile-${p.attr}-checkbox`)
    const isSelected = createMemo(()=>tempData.slugsSelected.includes(p.attr))
    const onClick = () => optionOnClick(p.attr)

    return (
        <li
            onClick={onClick} 
            class={`group list-image-[url(/filter-attr-not-selected.svg)] [&:has(:checked)]:list-image-[url(/filter-attr-selected.svg)] py-1 font-light text-xs tracking-wider align-bottom ${!!count() ? 'cursor-pointer' : 'cursor-default text-gray-400'}`}
        >
            <input ref={checkboxRef} id={checkboxID()} hidden type="checkbox" class="peer" checked={isSelected()} />
            <span class={!!count() ? "relative inline-block after:absolute after:bottom-0 after:bg-black after:h-px after:left-0 after:w-0 after:duration-300 touchscreen:after:hidden mouse:group-hover:after:w-full" : ''}>{capitalizeEveryWord(p.attr.replaceAll('-', ' ')) + (!!count() ? ` (${count()})` : '')}</span>
        </li>
    )
}

export default FilterMobileAttributeOption