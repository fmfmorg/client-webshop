import { createSignal, For, onCleanup, onMount } from 'solid-js'
// import { FM_HEADER_CAROUSEL_OFF_COOKIE_KEY } from 'astro:env/client'
import { dispatchInternalEvent, headerCarouselOffKey } from '@misc'
import { HEADER_TEXT_CAROUSEL_LOADED } from '@misc/event-keys'

const TextCarouselLine = ({texts}:{texts:string[]}) => (
    <p class='header-carousel-p'>
        <For each={texts} children={e=><span class="header-carousel-span">{e}</span>} />
    </p>
)

const TextCarousel = ({texts}:{texts:string[]}) => {
    let resizeTimeout

    const [pCount,setPCount] = createSignal(1)
    const [notLoaded,setNotLoaded] = createSignal(true)

    const pCountOnResize = async() => {
        const { innerWidth } = window
        const firstP = document.getElementsByClassName('header-carousel-p')[0]
        const width = firstP.getBoundingClientRect().width
        setPCount(Math.ceil(innerWidth / width)+1)

        if (notLoaded()){
            const styleElem = document.createElement('style')
            const cssRule = `.header-carousel-p{animation-duration: ${width * 0.03}s;}`
            styleElem.appendChild(document.createTextNode(cssRule))
            document.getElementsByTagName('head')[0].appendChild(styleElem)

            setNotLoaded(false)
        }
    }

    const onResize = () => {
        clearInterval(resizeTimeout)
        setTimeout(pCountOnResize,200)
    }

    const checkboxOnClick = (ev:InputEvent) => {
        const checked = (ev.target as HTMLInputElement).checked
        if (checked) document.cookie = `${headerCarouselOffKey}=1; path=/`
    }

    onMount(()=>{
        pCountOnResize()
        window.addEventListener('resize',onResize,true)
        dispatchInternalEvent(HEADER_TEXT_CAROUSEL_LOADED)

        onCleanup(()=>{
            window.removeEventListener('resize',onResize,true)
        })
    })

    return (
        <>
        <input type='checkbox' class='peer' id='header-carousel-checkbox' hidden onClick={checkboxOnClick} />
        <div class='header-carousel-container relative flex peer-checked:hidden overflow-hidden whitespace-nowrap uppercase bg-gray-600 text-white text-xs py-1 tracking-widest [word-spacing:0.15rem]'>
            {Array(pCount()).fill(undefined).map(()=>(<TextCarouselLine texts={texts} />))}
            <label for='header-carousel-checkbox' class='absolute right-0 top-0 bottom-0 bg-gray-600 cursor-pointer'>
                <svg viewBox='0 0 30 30' class='stroke-white fill-none stroke-[4] h-6 w-6 p-2' stroke-linecap='round'>
                    <line x1='3' y1='3' x2='27' y2='27' />
                    <line x1='3' y1='27' x2='27' y2='3' />
                </svg>
            </label>
        </div>
        </>
    )
}

export default TextCarousel