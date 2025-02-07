import { capitalizeEveryWord, type ICatalogueMap } from "@misc";
import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX } from "astro:env/client";

export const collectionPageSchema = (
    title:string,
    description:string,
    image:string,
    collectionName:string,
    productIDs:string[],
    productMap:ICatalogueMap,
    origin:string,
    mainType:string,
    subCollectionSlug:string,
    subCollectionName:string,
) => {
    const breadcrumbItems = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": capitalizeEveryWord(mainType),
            "item": `${origin}/collections/${mainType}`
        },
    ]

    if (!!subCollectionSlug && !!subCollectionName) breadcrumbItems.push({
        "@type": "ListItem",
        "position": 3,
        "name": subCollectionName,
        "item": `${origin}/collections/${mainType}/${subCollectionSlug}`
    })

    return JSON.stringify({
        "@context":"http://schema.org",
        "@type":"CollectionPage",
        "name":title,
        description,
        ...!!image && {image},
        mainEntity:{
            "@type": "OfferCatalog",
            "name":collectionName,
            "numberOfItems":productIDs.length,
            "itemListOrder":"ItemListUnordered",
            "itemListElement":productIDs.map((e,i)=>{
                const p = productMap[e]
                const inStock = (!!p.stockQuantities && !!p.stockQuantities.length) ? !!p.stockQuantities.map(e=>e.quantity).reduce((a,b)=>a+b,0) : false
                return {
                    "@type":"ListItem",
                    "position":i + 1,
                    "item":{
                        "@type": "Product",
                        "name":p.name,
                        "url":[origin,p.mainType,p.url,p.id].join('/'),
                        ...!!p.snippetImages && !!p.snippetImages.length && {"image":PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + p.snippetImages[0]},
                        "offers":{
                            "@type": "Offer",
                            "priceCurrency": "GBP",
                            "price": (p.discountedPrice * 0.01).toFixed(2),
                            "itemCondition": "https://schema.org/NewCondition",
                            "availability": `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
                        }
                    }
                }
            })
        },
        "breadcrumb":{
            "@type": "BreadcrumbList",
            "itemListElement":breadcrumbItems
        }
    })
}