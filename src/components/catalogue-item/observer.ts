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

                cataItem.classList.remove('hidden')
            }

            observer.unobserve(entry.target)
        }
    })
}

export const observer = new IntersectionObserver(observerCallback,{rootMargin:'200px'})