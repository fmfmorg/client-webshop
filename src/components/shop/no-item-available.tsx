import { onMount, onCleanup } from 'solid-js'
import { whiteBtnClass } from "@misc";

const NoItemAvailable = () => {
    let ref, resizeTimeout

    const resize = () => {
        const { innerHeight } = window
        const header = document.getElementsByTagName('header')[0] as HTMLDivElement
        const footer = document.getElementsByTagName('footer')[0] as HTMLDivElement

        const { height: headerHeight } = header.getBoundingClientRect()
        const { height: footerHeight } = footer.getBoundingClientRect()

        ref.style.minHeight = `${innerHeight - headerHeight - footerHeight}px`
    }

    const onResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(resize,100)
    }
    
    onMount(()=>{
        resize()
        window.addEventListener('resize',onResize,true)

        onCleanup(()=>{
            window.removeEventListener('resize',onResize,true)
        })
    })

    return (
        <div ref={ref} class='m-auto w-fit flex flex-col justify-center'>
            <p class='text-center font-light text-xl'>Oops... Nothing here.</p>
            <a href='/collections/earrings' class={`${whiteBtnClass} px-4`}>Back to Shop</a>
        </div>
    )
}

export default NoItemAvailable