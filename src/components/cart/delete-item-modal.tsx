import { submitBtnClass, whiteBtnClass } from '@misc';
import { onMount, onCleanup } from 'solid-js'

const DeleteItemModal = (p:{
    name:string;
    deleteItem:()=>void;
    cancel:()=>void;
}) => {
    const toggleBlur = (blur:boolean) => {
        const header = document.getElementsByTagName('header')[0]
        const cartContent = document.getElementById('cart-content')
        const sidebarCheckbox = document.getElementById('shopping-bag-sidebar-checkbox') as HTMLInputElement
        if (!!header) header.classList.toggle('blur-sm',blur)
        if (!!cartContent) cartContent.classList.toggle('blur-sm',blur)
        if (!!sidebarCheckbox) sidebarCheckbox.disabled = blur
    }

    onMount(()=>{
        toggleBlur(true)
        onCleanup(()=>toggleBlur(false))
    })

    return (
        <>
        <div class="fixed top-0 left-0 w-full h-full bg-white opacity-50 z-50"></div>
        <div class='fixed top-0 left-0 w-full h-full flex flex-col justify-center z-[60]'>
            <div class='flex justify-center'>
                <div class='border border-black max-w-96 w-full mx-4 bg-white p-4'>
                    <p class='text-center font-light tracking-wide [word-spacing:0.1rem]'>Are you sure you want to remove <span class='font-semibold'>{p.name}</span> from your shopping bag?</p>
                    <div class='xs:flex xs:space-x-4'>
                        <button class={`${whiteBtnClass} text-xs`} onClick={p.cancel}>Cancel</button>
                        <button class={`${submitBtnClass.replace('mt-6','mt-4')} text-xs`} onClick={p.deleteItem}>Remove</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default DeleteItemModal