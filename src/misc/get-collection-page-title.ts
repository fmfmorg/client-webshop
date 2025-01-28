import { capitalizeEveryWord } from "./capitalize-every-word";

export const getCollectionPageTitle = (
    slugs:string[],
    collectionMenuMap: {
        [c: string]: {
            [d: string]: string[];
        };
    }
) => {
    const mainType = slugs[0]
    const subCollectionMap = collectionMenuMap[mainType]
    let arr:string[] = []

    if (mainType === 'earrings'){
        const { subType, metalColor, material } = subCollectionMap
        arr = [
            ...metalColor.filter(e=>slugs.includes(e)).map(e=>e.replaceAll('-',' ')),,
            ...material.filter(e=>slugs.includes(e)).map(e=>e.replaceAll('-',' ')),
            ...subType.filter(e=>slugs.includes(e)).map(e=>e.replaceAll('-earrings','').replaceAll('-',' ')),
            'earrings'
        ]
    }
    return capitalizeEveryWord(arr.join(' '))
}