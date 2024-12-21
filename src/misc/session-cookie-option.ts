import type { AstroCookieSetOptions } from "astro";

export const sessionCookieOption = (secure:boolean,expiresAt?:number):AstroCookieSetOptions => ({
    httpOnly:true,
    path:'/',
    encode:(v)=>v,
    secure,
    // ...(secure && {sameSite:'none'}),
    ...(!!expiresAt && {expires:new Date(expiresAt)}),
    // ...(secure && {domain: FM_CLIENT_WEBSHOP_API_URL.replaceAll('https://','').replaceAll('http://','').replaceAll('api-shop','')})
})