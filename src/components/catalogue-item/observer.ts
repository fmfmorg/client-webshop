import { getImageStyle } from "./image-style"

const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach(entry=>{
        if (entry.isIntersecting){
            const currentItemGroup = +(entry.target as HTMLElement).dataset.gp
            const nextGroup = `${currentItemGroup + 1}`

            const catalogueItems = document.getElementsByTagName('astro-catalogue-product')
            const catalogueItemLen = catalogueItems.length

            for (let i=0; i<catalogueItemLen; i++) {
                const cataItem = catalogueItems.item(i) as HTMLElement
                if (cataItem.dataset.gp !== nextGroup) continue

                const carouselImages = cataItem.getElementsByTagName('astro-carousel-image')
                const imageLen = carouselImages.length

                for (let j=0; j<imageLen; j++) {
                    const image = carouselImages.item(j) as HTMLElement
                    const name = image.dataset.name
                    const ext = image.dataset.ext
                    const imgHolder = image.getElementsByClassName('img-holder')[0] as HTMLDivElement
                    imgHolder.style.backgroundImage = getImageStyle(name,ext,768)
                }

                cataItem.classList.remove('hidden')
            }

            observer.unobserve(entry.target)
        }
    })
}

export const observer = new IntersectionObserver(observerCallback,{rootMargin:'200px'})