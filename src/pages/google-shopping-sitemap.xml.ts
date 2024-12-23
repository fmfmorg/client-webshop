import { httpRequestHeader } from '@misc'
import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/server'
import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX, PUBLIC_FM_COMPANY_NAME_SHORT } from 'astro:env/client'

interface IProductDetails {
    productID:string;
	name:string;
	description:string;
	price:number;
	discountedPrice:number;
	slug:string;
	metalColor:string;
	productMainType:string;
	productSubType:string;
	inStock:boolean;
	images:string[];
}

export async function GET({url}:{url:URL}) {
    const resp = await fetch(`${ FM_CLIENT_WEBSHOP_API_URL }/webshop/sitemap/shopping`,{
      headers:httpRequestHeader(false,'SSR',false)
    })
    if (!resp.ok) return new Response(null, {status:500})
    const { products } = await resp.json() as { products: IProductDetails[]; }

    let { origin } = url
    origin = origin.replaceAll('http://','https://')

    const sitemap = `
        <?xml version="1.0"?>
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
            <channel>
                <title>Fairy Made Accessories</title>
                <link>https://store.google.com</link>
                <description>Fairy Made Accessories</description>
                ${products.map(p=>`
                    <item>
                        <g:id>${p.productID}</g:id>
                        <g:title>${p.name} for Her</g:title>
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
                        <g:condition>new</g:condition>
                        <g:google_product_category>194</g:google_product_category>
                        <g:identifier_exists>no</g:identifier_exists>
                        <g:color>${p.metalColor}</g:color>
                        <g:availability>${p.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
                        <g:price>${(p.price * 0.01).toFixed(2)} GBP</g:price>
                        <g:brand>${PUBLIC_FM_COMPANY_NAME_SHORT}</g:brand>
                        <g:gender>female</g:gender>
                        <g:age_group>adult</g:age_group>
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