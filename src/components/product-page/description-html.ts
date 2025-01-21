import type { IProduct } from '@components/catalogue-item/interfaces';
import type { IProductMeasurement } from '@misc/interfaces';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const getListPoint = (m:IProductMeasurement, soldAsPair:boolean) => {
    const { width, depth, height, weight } = m

    let s = ''

    let dimensions:string[] = []
    if (!!width) dimensions.push(`Width ${width}mm`)
    if (!!depth) dimensions.push(`Depth ${depth}mm`)
    if (!!height) dimensions.push(`Height ${height}mm`)
    if (!!dimensions.length) s += `\n- **Dimensions**: ${dimensions.join(' x ')}`

    if (!!weight) s += `\n- **Weight**: ${weight}g${soldAsPair ? ' each' : ''}`

    return s
}

export const descriptionHTML = (productDetails:IProduct) => {
    let { description, soldAsPair, measurements } = productDetails
    const measurementCount = measurements.length

    description += '\n'

    if (!!measurementCount){
        if (measurementCount === 1) {
            description += getListPoint(measurements[0],soldAsPair)
        } else {
            const points = measurements.map(m=>{
                const { width, depth, height, weight } = m
                let dimensions:string[] = [], phrases:string[] = []
                if (!!width) dimensions.push(`Width ${width}mm`)
                if (!!depth) dimensions.push(`Depth ${depth}mm`)
                if (!!height) dimensions.push(`Height ${height}mm`)

                if (!!dimensions) phrases.push(dimensions.join(' x '))
                if (!!weight) phrases.push(`Weight ${weight}g`)

                return phrases.join(', ')
            })
            if (points.length === 1) description += getListPoint(measurements.find(e=>!!e.width || !!e.depth || !!e.height || !!e.weight),soldAsPair)
            else if (points.length > 1) description += `${points.map((e,i)=>`\n${i+1}. ${e}`).join('')}`
        }
    }

    description += `\n- Sold as a ${soldAsPair ? 'pair' : 'single piece'}`
    
    const rawHtml = sanitizeHtml(marked.parse(description) as string);
    return rawHtml
}