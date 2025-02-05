import { createEffect, createMemo, onMount, useContext, Show } from 'solid-js'
import { capitalizeEveryWord } from "@misc";
import { FilterHybridContext } from '../context';

const OptionTablet = (p:{
    attr:string;
}) => {
    let checkboxRef

    const { tempData, optionOnClick, tempFacetCountMap } = useContext(FilterHybridContext)
    const count = createMemo(()=>tempFacetCountMap[p.attr] || 0)
    const isSelected = createMemo(()=>tempData.slugsSelected.includes(p.attr))
    const checkboxID = createMemo(()=>`filter-tablet-${p.attr}-checkbox`)
    const onClick = () => optionOnClick(p.attr)

    return (
        <li 
            onClick={onClick} 
            class={`group list-image-[url(/filter-attr-not-selected.svg)] [&:has(:checked)]:list-image-[url(/filter-attr-selected.svg)] py-0.5 font-light text-sm tracking-wider align-bottom ${!!count() ? 'cursor-pointer' : 'cursor-default text-gray-400'}`}
        >
            <input ref={checkboxRef} id={checkboxID()} hidden type="checkbox" class="peer" checked={isSelected()} />
            <span class={!!count() ? "relative inline-block after:absolute after:bottom-0 after:bg-black after:h-px after:left-0 after:w-0 after:duration-300 touchscreen:after:hidden mouse:group-hover:after:w-full" : ''}>{capitalizeEveryWord(p.attr.replaceAll('-', ' ')) + (!!count() ? ` (${count()})` : '')}</span>
        </li>
    )
}

export default OptionTablet