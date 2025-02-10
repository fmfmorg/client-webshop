import { useContext, Show } from 'solid-js'
import './style.scss'
import { FilterMasterContext } from './context';

const atfReadMoreCheckboxID = 'atf-read-more-checkbox'

const AboveTheFold = () => {
    const { descriptions } = useContext(FilterMasterContext)
    return (
        <Show 
            when={!!descriptions.aboveTheFold} 
            children={
                <div class="flex justify-center p-4 text-center z-20 relative bg-white">
                    <div class='above-the-fold'>
                        <input id={atfReadMoreCheckboxID} type='checkbox' hidden class='peer' />
                        <div innerHTML={descriptions.aboveTheFold} />
                        <label for={atfReadMoreCheckboxID} class="text-xs peer-[:not(:checked)]:[&>span:last-of-type]:hidden peer-checked:[&>span:first-of-type]:hidden xs:hidden cursor-pointer">
                            <span>Read More</span>
                            <span>Read Less</span>
                        </label>
                    </div>
                </div>
            }
        />
    )
}

const BelowTheFold = () => {
    const { descriptions } = useContext(FilterMasterContext)
    return (
        <Show
            when={!!descriptions.belowTheFold}
            children={
                <div class='flex justify-center'>
                    <div class='max-w-7xl md:mx-4 md:bg-neutral-100 mt-4 md:mb-12 below-the-fold' innerHTML={descriptions.belowTheFold} />
                </div>
            }
        />
    )
}

export {
    AboveTheFold,
    BelowTheFold,
}