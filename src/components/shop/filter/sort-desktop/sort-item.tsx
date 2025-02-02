import { createMemo, useContext } from 'solid-js'
import { FilterMasterContext } from '../context';
import sortOrder from '../sort-menu-options.json'

const SortItem = (p:{
    name:string;
    slug:string;
}) => {
    const { updateURL, currentURL } = useContext(FilterMasterContext)

    const currentSlug = createMemo(()=>{
        const searchParams = new URLSearchParams(currentURL.search)
        if (!searchParams.has('sort')) return sortOrder[0].slug
        const sortValue = searchParams.get('sort').toLowerCase()
        const matchingItem = sortOrder.find(e=>e.slug === sortValue)
        if (!!matchingItem) return matchingItem.slug
        return sortOrder[0].slug
    })

    const onClick = () => {
        const sortMenuCheckbox = document.getElementById('desktop-sort-menu-checkbox') as HTMLInputElement
        if (!!sortMenuCheckbox && sortMenuCheckbox.checked) sortMenuCheckbox.click()

        if (currentSlug() !== p.slug){
            const newSearchParams = new URLSearchParams(currentURL.search)
            newSearchParams.set('sort',p.slug)
            updateURL(`${currentURL.pathname}?${newSearchParams.toString()}`,"")
        }
    }

    return (
        <li>
            <input name='desktop-sort' id={`desktop-sort-${p.slug}`} onClick={onClick} type="radio" hidden class="peer" checked={currentSlug() === p.slug} />
            <label for={`desktop-sort-${p.slug}`} class="px-2 py-1 block text-sm font-light tracking-wider w-full text-left peer-checked:font-semibold mouse:hover:bg-gray-100 cursor-pointer">
                <span>{p.name}</span>
            </label>
        </li>
    )
}

export default SortItem