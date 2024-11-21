export const dispatchInternalEvent = (key:string, detail?:any) => document.dispatchEvent(
    new CustomEvent(key,{detail})
)