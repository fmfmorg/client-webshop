import { useContext, For } from 'solid-js'
import { FilterMasterContext } from "./context"
import { capitalizeEveryWord } from '@misc';

const FilterChip = (p:{slug:string;}) => {
    const { currentURL, updateURL } = useContext(FilterMasterContext)
    const onClick = () => {
        const newPathname = currentURL.pathname.split('/').filter(e=>e!==p.slug).join('/')
        updateURL(`${newPathname}${currentURL.search}`,p.slug)
    }

    return (
        <li class="mr-3 flex border border-gray-400 pl-3 py-px rounded-md mb-2">
            <span class="text-xs my-auto font-light tracking-widest text-gray-600">{capitalizeEveryWord(p.slug.replaceAll('-', ' '))}</span>
            <button onClick={onClick} type="button" class="p-3 group -ml-1">
                <svg viewBox="0 0 10 10" class="h-2 w-2 fill-none stroke-1 stroke-gray-600 scale-[1.2] group-hover:scale-[1.5] group-hover:scale-[1.5]">
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="1" y1="9" x2="9" y2="1" />
                </svg>
            </button>
        </li>
    )
}

const ChipsContainer = () => {
    const { currentURL } = useContext(FilterMasterContext)
    return (
        <ul class="flex flex-wrap px-4 pt-2">
            <For 
                each={currentURL.slugOrder}
                children={e=><FilterChip slug={e} />}
            />
        </ul>
    )
}

export default ChipsContainer