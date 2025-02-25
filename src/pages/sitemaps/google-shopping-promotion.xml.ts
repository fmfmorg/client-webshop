import { httpRequestHeader, httpToHttps } from '@misc'
import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/server'
import { PUBLIC_FM_COMPANY_NAME_SHORT } from 'astro:env/client'

export async function GET({url}:{url:URL}) {
    let { origin } = url
    origin = httpToHttps(origin)

    const resp = await fetch(`${ FM_CLIENT_WEBSHOP_API_URL }/webshop/sitemap/google-shopping-promotion`,{
        headers:httpRequestHeader(false,'SSR',false)
    })
    if (!resp.ok) return new Response(null, {status:500})
    const { campaigns } = await resp.json() as { campaigns: string; }

    const sitemap = `
            <?xml version="1.0"?>
            <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
                <channel>
                    <title>${PUBLIC_FM_COMPANY_NAME_SHORT}</title>
                    <link>${origin}</link>
                    <description>Fashion Jewellery for Her</description>
                    <promotions>
                        ${campaigns}
                    </promotions>
                </channel>
            </rss>
        `.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}