const FilterMobileAttributeHeader = (p:{
    attrName:string;
    headerName: string;
    mobileRadioInput: string;
    mobileHeaderLabelID: string;
    attrSelected:string;
    updateAttr:(s:string)=>void;
}) => {
    const onInput = (ev:Event) => p.updateAttr((ev.target as HTMLInputElement).value)
    return (
        <li class="border border-x-transparent border-t-transparent border-b-gray-300 [&:has(:checked)]:border-b-transparent [&:has(:checked)]:border-x-gray-300 flex-none">
            <label class="px-3 py-1 block">
                <input onInput={onInput} type='radio' hidden name='filter-mobile-attribute-header' checked={p.attrName === p.attrSelected} class='peer' value={p.attrName} />
                <span class='uppercase tracking-widest font-semibold text-2xs'>{p.headerName}</span>
            </label>
        </li>
    )
}

export default FilterMobileAttributeHeader