import type { AstroCookieSetOptions } from "astro";

export const sessionCookieOption = (expiresAt?:number):AstroCookieSetOptions => ({
    httpOnly:true,
    path:'/',
    encode:(v)=>v,
    ...(!!expiresAt && {expires:new Date(expiresAt)}),
})