import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/server'
import { httpRequestHeader } from '@misc';

export async function GET() {
    const resp = await fetch(`${ FM_CLIENT_WEBSHOP_API_URL }/webshop/sitemap/google-shopping-promotion`,{
        headers:httpRequestHeader(false,'SSR',false)
    })
    if (!resp.ok) return new Response(null, {status:500})
    const { campaigns } = await resp.json() as { campaigns: string; }
    const sitemap = `
        <?xml version="1.0"?>
        <promotions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="promotions.xsd">
            ${campaigns}
        </promotions>
    `.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}