export const catalogueItemsOnResize = () => {
    const { innerWidth } = window
    const isTouchScreen = window.matchMedia && matchMedia("(pointer:coarse)").matches;

    const elems = document.getElementsByTagName('astro-carousel-image')
    const elemsLen = elems.length
    
    for (let i=0; i<elemsLen; i++){
        const elem = elems.item(i) as HTMLElement
        const isProductPageCarousel = !!(+elem.dataset.productPageKeyProduct)
        if (!isProductPageCarousel && !isTouchScreen) continue

        const index = +(elem.dataset.index)
        const len = +(elem.dataset.len)
        if (isNaN(index) || isNaN(len)) continue

        const input = elem.getElementsByTagName('input')[0] as HTMLInputElement
        
        let radioWidth = 0, gap = 0
        
        if (isProductPageCarousel){
            radioWidth = innerWidth < 280 ? 0.375 : 0.5
            gap = innerWidth < 280 ? 0.5 : 0.625
        } else {
            radioWidth = innerWidth < 475 ? 0.25 : 0.375
            gap = innerWidth < 475 ? 0.35 : 0.45
        }

        const totalWidth = len * radioWidth + (len - 1) * gap
        const fromBarLeft = (radioWidth + gap) * index
        const pos = totalWidth * -0.5 + fromBarLeft
        const left = `calc(50%${pos === 0 ? '' : pos > 0 ? ` + ${pos}rem` : ` - ${Math.abs(pos)}rem`})`
        input.style.left = left
    }
}