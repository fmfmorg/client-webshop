import { httpRequestHeader, httpToHttps } from '@misc'
import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/server'
import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX, PUBLIC_FM_COMPANY_NAME_SHORT } from 'astro:env/client'
import type { ISitemapProductDetails } from '@misc/interfaces'



export async function GET({url}:{url:URL}) {
    const resp = await fetch(`${ FM_CLIENT_WEBSHOP_API_URL }/webshop/sitemap/google-shopping`,{
      headers:httpRequestHeader(false,'SSR',false)
    })
    if (!resp.ok) return new Response(null, {status:500})
    const { products } = await resp.json() as { products: ISitemapProductDetails[]; }

    let { origin } = url
    origin = httpToHttps(origin)

    const sitemap = `
        <?xml version="1.0"?>
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
            <channel>
                <title>${PUBLIC_FM_COMPANY_NAME_SHORT}</title>
                <link>${origin}</link>
                <description>Fashion Jewellery for Her</description>
                ${products.map(p=>`
                    <item>
                        <g:id>${p.productID}</g:id>
                        <g:title>${p.name}</g:title>
                        <g:description>${p.description}</g:description>
                        <g:link>${origin + '/product/' + p.slug + '/' + p.productID}</g:link>
                        ${
                            p.images.map((img,i)=>
                                !!i 
                                ? i <= 10 
                                    ? `<g:additional_image_link>${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + img}</g:additional_image_link>`
                                    : ''
                                : `<g:image_link>${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + img}</g:image_link>`
                            ).join('')
                        }
                        ${
                            p.lifestyleImages.filter(e=>!!e).map((img)=>`<g:lifestyle_image_link>${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + img}</g:lifestyle_image_link>`).join('')
                        }
                        <g:condition>new</g:condition>
                        <g:google_product_category>194</g:google_product_category>
                        <g:product_type>Apparel &amp; Accessories &gt; Jewelry &gt; Earrings</g:product_type>
                        <g:color>${p.metalColor}</g:color>
                        <g:availability>${p.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
                        <g:price>${(p.price * 0.01).toFixed(2)} GBP</g:price>
                        <g:brand>${PUBLIC_FM_COMPANY_NAME_SHORT}</g:brand>
                        <g:gender>female</g:gender>
                        <g:age_group>adult</g:age_group>
                        <g:adult>no</g:adult>
                        <g:is_bundle>no</g:is_bundle>
                    </item>
                `).join('')}
            </channel>
        </rss>
    `.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}