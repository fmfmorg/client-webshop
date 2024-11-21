export const getCookieValueWithKey = (cookies:string[], key:string) => {
    if (!cookies.length) return null

    for (let cookie of cookies) {
        const [cookieKV] = cookie.split(';')
        const [cookieK,cookieV] = cookieKV.split('=')
        if (cookieK.trim()===key) return cookieV
    }
    return null
}