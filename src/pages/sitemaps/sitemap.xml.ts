import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'
import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/server'
import { httpRequestHeader, httpToHttps } from '@misc';
import type { IProduct } from '@components/catalogue-item/interfaces';

export async function GET({url}:{url:URL}) {
    const resp = await fetch(`${ FM_CLIENT_WEBSHOP_API_URL }/webshop/sitemap`,{
      headers:httpRequestHeader(false,'SSR',false)
    })
    if (!resp.ok) return new Response(null, {status:500})
    const { products } = await resp.json() as { products: IProduct[] }

    let { origin } = url
    origin = httpToHttps(origin)

    const currentDT = new Date().toISOString()

    const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
            <url>
                <loc>${origin}</loc>
                <lastmod>${currentDT}</lastmod>
            </url>
            ${products.map(({mainType,id,url:_url,images})=>`<url>
              <loc>${origin + '/' + mainType + '/' + _url + '/' + id }</loc>
              <lastmod>${currentDT}</lastmod>
              <changefreq>weekly</changefreq>
              <image:image>
              ${images.map(({name,ext})=>`
                <image:loc>${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + name + ext}</image:loc>
              `).join('')}
              </image:image>
            </url>`).join('')}
        </urlset>
    `.trim();

    return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
        },
    });
}