import type { AstroCookieSetOptions } from "astro";

export const sessionCookieOption = (secure:boolean,expiresAt?:number):AstroCookieSetOptions => ({
    httpOnly:true,
    path:'/',
    encode:(v)=>v,
    secure,
    ...(!!expiresAt && {expires:new Date(expiresAt)}),
})