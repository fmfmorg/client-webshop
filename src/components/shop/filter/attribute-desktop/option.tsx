import { capitalizeEveryWord, collectionPageNoIndex } from "@misc"
import { createMemo, useContext } from "solid-js"
import {FilterMasterContext, FilterSubContext} from "../context"

const Option = (p:{attr:string;}) => {
    const { currentURL, pathnamePrefixArr, updateURL, facetCountMap, mainProductType, filterAttributes } = useContext(FilterMasterContext)
    const { slugOrder } = useContext(FilterSubContext)
    const slugsInCurrentPathname = createMemo(()=>currentURL.pathname.split('/').filter(e=>!pathnamePrefixArr.includes(e)))
    const isSelected = createMemo(()=>slugsInCurrentPathname().includes(p.attr))

    const href = createMemo(()=>{
        if (isSelected()) return currentURL.pathname.split('/').filter(e=>e !== p.attr).join('/') + currentURL.search
        const slugs = [...slugsInCurrentPathname(),p.attr].map(e=>slugOrder.find(({slug})=>slug===e)).sort((a,b)=>a.index - b.index).map(({slug})=>slug)
        return [...pathnamePrefixArr,...slugs].join('/') + currentURL.search
    })
    
    const nofollow = createMemo(()=>collectionPageNoIndex(href().split('?')[0],mainProductType,filterAttributes))

    const count = createMemo(()=>facetCountMap[p.attr] || 0)

    const onClick = (ev:Event) => {
        ev.preventDefault()
        updateURL(href(), p.attr)
    }

    const show = createMemo(()=>!!facetCountMap[p.attr])

    return (
        <li class={`[&:has(:checked)]:list-image-[url(/filter-attr-selected.svg)] ${show() ? '' : 'hidden'}`.trim()}>
            <input type="checkbox" hidden class="peer" checked={isSelected()} />
            <a {...nofollow() && {rel:'nofollow'}} onClick={onClick} href={href()} class="font-light text-xs tracking-widest peer-checked:font-semibold group">
                <span class="relative inline-block after:absolute after:bottom-0 after:bg-black after:h-px after:left-0 after:w-0 after:duration-300 touchscreen:after:hidden mouse:group-hover:after:w-full">{`${capitalizeEveryWord(p.attr.replaceAll('-', ' '))}${!!count() ? ` (${count()})` : ''}`}</span>
            </a>
        </li>
    )
}

export default Option