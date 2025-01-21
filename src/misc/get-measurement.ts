import type { IProductMeasurement } from "./interfaces"

export const getMeasurement = (m:IProductMeasurement[],key:'width'|'depth'|'height'|'weight',soldAsPair:boolean) => {
  if (!m || !m.length) return 0
  if (key === 'weight') {
    if (soldAsPair) {
      if (m.length === 1) return m[0].weight * 2
      else return m.map(e=>e[key]).reduce((a,b)=>a+b,0)
    } else {
      return m.find(e=>!!e[key])[key]
    }
  } else return Math.max(...m.map(e=>e[key]))
}