import type { IProductMeasurement } from "./interfaces"

export const getMeasurement = (m:IProductMeasurement[],key:'width'|'depth'|'height'|'weight',soldAsPair:boolean) => {
  if (!m || !m.length) return 0
  let result = 0
  if (key === 'weight') {
    if (soldAsPair) {
      if (m.length === 1) result = m[0].weight * 2
      else result = m.map(e=>e[key]).reduce((a,b)=>a+b,0)
    } else {
      result = m.find(e=>!!e[key])[key]
    }
  } else result = Math.max(...m.map(e=>e[key]))
  return Math.round(result)
}