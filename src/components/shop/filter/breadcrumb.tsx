import { createMemo, useContext, For } from 'solid-js'
import { FilterMasterContext, FilterSubContext } from './context'
import type { ILink } from '@components/layout/footer/interfaces'
import { capitalizeEveryWord } from '@misc'

const Breadcrumb = () => {
    const { filterAttributes, mainProductType, currentURL, pathnamePrefixArr } = useContext(FilterMasterContext)
    const breadcrumbItems = createMemo(()=>{
        const firstItems:ILink[] = [
            {name:'Home',url:'/'},
            {name:capitalizeEveryWord(mainProductType.replaceAll('-',' ')),url:pathnamePrefixArr.join('/')}
        ]
        const slugs = currentURL.pathname.split('/').filter(e=>!pathnamePrefixArr.includes(e))
        if (!slugs.length) return firstItems

        const firstSlug = slugs[0]
        const attribute = Object.keys(filterAttributes).find(e=>filterAttributes[e].includes(firstSlug))
        
        let lastBreadcrumbName = ''

        switch (mainProductType){
            case 'earrings':
                if (attribute === 'subType') lastBreadcrumbName = capitalizeEveryWord(firstSlug.replaceAll('-',' '))
                else lastBreadcrumbName = capitalizeEveryWord(`${firstSlug.replaceAll('-',' ')} ${mainProductType}`)
                break;
            default: break;
        }
        const lastItem:ILink = {name:lastBreadcrumbName,url:[...pathnamePrefixArr,firstSlug].join('/')}
        return [...firstItems,lastItem]
    })

    return (
        <ul class="flex flex-wrap text-2xs 2xs:text-xs px-2 md:px-4 pt-2 md:py-2 z-20 relative bg-white">
            <For 
                each={breadcrumbItems()}
                children={(e,i)=>(
                    <>
                    {!!i() && <li class={`mx-1 ${(breadcrumbItems().length > 2 && i() === 1) ? 'hidden xs:list-item' : ''}`.trim()}>•</li>}
                    <li class={`${i() === breadcrumbItems().length - 1 ? 'font-semibold ' : ''}${breadcrumbItems().length > 2 ? !!i() ? '' : 'hidden xs:list-item ' : ''}hover:underline`}>
                        <a href={e.url}>{e.name}</a>
                    </li>
                    </>
                )}
            />
        </ul>
    )
}

export default Breadcrumb