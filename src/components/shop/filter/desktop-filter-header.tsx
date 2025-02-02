import { createMemo, useContext } from 'solid-js'
import { FilterMasterContext } from './context';

const DesktopFilterHeader = (p:{
    attrName:string;
    headerName:string;
    desktopRadioInput:string;
    desktopHeaderLabelID:string;
}) => {
    const { filterAttributes, facetCountMap } = useContext(FilterMasterContext)
    
    const show = createMemo(()=>{
        const attributes = filterAttributes[p.attrName]
        const counts = attributes.map(d=>facetCountMap[d] || 0)
        const sum = !!counts.length ? counts.reduce((a,b)=>a+b,0) : 0
        return !!sum
    })
    
    return (
        <label 
            class={`group tracking-widest font-semibold text-xs uppercase cursor-pointer ${show() ? '' : 'hidden'}`.trim()}
            for={p.desktopRadioInput}
            id={p.desktopHeaderLabelID}
        >
            <span class="relative inline-block after:absolute after:bottom-0 after:bg-black after:h-px after:left-0 after:w-0 after:duration-300 touchscreen:after:hidden mouse:group-hover:after:w-full">{p.headerName}</span>
        </label>
    )
}

export default DesktopFilterHeader