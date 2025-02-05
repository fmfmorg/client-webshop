import { createMemo, For, useContext } from 'solid-js'
import { capitalizeEveryWord } from "@misc";
import OptionTablet from './option';
import { FilterHybridContext, FilterMasterContext } from '../context';

const AttributeTablet = (p:{
    attrName:string;
    headerName:string;
    attributes:string[];
    tabletHeaderLabelID:string;
}) => {
    const { filterAttributes } = useContext(FilterMasterContext)
    const { tempData } = useContext(FilterHybridContext)
    const selectedOptionsCount = createMemo(()=>tempData.slugsSelected.filter(e=>filterAttributes[p.attrName].includes(e)).length)

    return (
        <div class="py-2">
            <input type="checkbox" hidden checked class="peer" id={p.tabletHeaderLabelID} />
            <label for={p.tabletHeaderLabelID} class={`font-serif tracking-wide ${!!selectedOptionsCount() ? 'font-black text-black' : 'font-semibold text-gray-500'} cursor-pointer flex justify-between peer-checked:[&>svg>line:last-child]:hidden`}>
                <span>{capitalizeEveryWord(p.headerName) + (!!selectedOptionsCount() ? ` (${selectedOptionsCount()})` : '')}</span>
                <svg viewBox="0 0 100 100" class="h-3 w-3 fill-none stroke-black my-auto" stroke-width="0.5rem">
                    <line x1="5" y1="50" x2="95" y2="50" />
                    <line x1="50" y1="5" x2="50" y2="95" />
                </svg>
            </label>
            <ul class="max-h-0 overflow-y-hidden peer-checked:max-h-fit transition-all duration-300 list-inside">
                <For 
                    each={p.attributes}
                    children={e=>(<OptionTablet attr={e} />)}
                />
            </ul>
        </div>
    )
}

export default AttributeTablet