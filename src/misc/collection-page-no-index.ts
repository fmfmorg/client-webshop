export const collectionPageNoIndex = (pathname:string,mainProductType:string,filterAttributes: {[d: string]: string[]}, productCount:number) => {
    if (!productCount) return true
    
    const pathnamePrefixArr = ['','collections',mainProductType]
    const slugs = pathname.split('/').filter(e=>!pathnamePrefixArr.includes(e))

    if (slugs.length > 2) return true

    const allAttrOptions = Object.values(filterAttributes).flat()

    const filterAttrKeys = Object.keys(filterAttributes)

    const items = slugs.filter(e=>allAttrOptions.includes(e)).map(e=>filterAttrKeys.find(k=>filterAttributes[k].includes(e)))

    const countObj = items.reduce((acc,curr)=>{
        acc[curr] = (acc[curr] || 0) + 1
        return acc
    },{})

    const counts = Object.values(countObj) as number[]

    return !!counts.length ? Math.max(...counts) > 1 : false
}