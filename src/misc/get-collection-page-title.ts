import { capitalizeEveryWord } from "./capitalize-every-word";

export const getCollectionPageTitle = (
    slugs:string[],
    subCollectionMap: {
        [d: string]: string[];
    }
) => {
    const mainType = slugs[0]
    let arr:string[] = []

    if (mainType === 'earrings'){
        const { subType, metalColor, material } = subCollectionMap
        arr = [
            ...!!metalColor && metalColor.filter(e=>slugs.includes(e)).map(e=>e.replaceAll('-',' ')),
            ...!!material && material.filter(e=>slugs.includes(e)).map(e=>e.replaceAll('-',' ')),
            ...!!subType && subType.filter(e=>slugs.includes(e)).map(e=>e.replaceAll('-',' '))
        ]
        
        if (!subType || !subType.filter(e=>slugs.includes(e)).length) arr.push(mainType)
    }
    return `Affordable ${capitalizeEveryWord(arr.join(' '))} for Her`
}