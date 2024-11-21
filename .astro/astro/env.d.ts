declare module 'astro:env/client' {
	export const FM_CLIENT_WEBSHOP_REVOLUT_MODE: string;	
export const FM_HEADER_CAROUSEL_OFF_COOKIE_KEY: string;	
export const FM_COMPANY_NAME_SHORT: string;	
export const FM_COMPANY_NAME_FULL: string;	
export const FM_IMAGE_URL_PREFIX: string;	

}

declare module 'astro:env/server' {
	export const FM_CLIENT_WEBSHOP_API_URL: string;	


	export const getSecret: (key: string) => string | undefined;
}
