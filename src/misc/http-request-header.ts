export interface IHttpRequestHeader {
    [k:string]:string;
}

export const httpRequestHeader = (
    fetchCartContent:boolean,
    source:'client'|'SSR',
    renewSession:boolean,
    sessionID?:string,
    clientIP?:string,
    headerCarouselOn?:boolean,
) => {
    const result:IHttpRequestHeader = {
        "X-Fetch-Cart-Content":JSON.stringify(fetchCartContent),
        "X-Request-Source":source,
        "X-Renew-Session":JSON.stringify(renewSession),
    }
    if (!!sessionID) result["X-Session-ID"] = sessionID
    if (!!clientIP) result["X-Client-IP"] = clientIP
    if (!!headerCarouselOn) result["X-Header-Carousel-On"] = "true"
    return result
}