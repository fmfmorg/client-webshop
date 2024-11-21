const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

export const formatPrice = (price: number) => formatter.format(price * 0.01)
export const formatPriceInteger = (price:number) => formatter.formatToParts(price * 0.01).map(({type,value})=>{
    switch (type){
        case 'decimal': return '';
        case 'fraction': return '';
        default: return value;
    }
}).reduce((a,b)=>a+b,'')