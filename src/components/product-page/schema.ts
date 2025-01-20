import type { IProduct } from '@components/catalogue-item/interfaces'
import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX, PUBLIC_FM_COMPANY_NAME_SHORT } from 'astro:env/client'

export const productSchema = (p:IProduct, url:URL) => {
    const href = url.href.replaceAll('http://','https://')
    const origin = url.origin.replaceAll('http://','https://')
    const shippingInfoPagePathname = '/terms/delivery'
    const inStock = (!!p.stockQuantities && !!p.stockQuantities.length) ? !!p.stockQuantities.map(e=>e.quantity).reduce((a,b)=>a+b,0) : false

    return JSON.stringify({
        "@context": "https://schema.org",
        "@graph":[
          {
            "@type": "Product",
            "name": p.name,
            "description": p.description.replaceAll('<p>','').replaceAll('</p>','').trim(),
            "brand": {
              "@type": "Brand",
              "name": PUBLIC_FM_COMPANY_NAME_SHORT
            },
            "image": p.snippetImages.map(e=>PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX+e),
            "size": "Standard",
            "sku": p.id,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "GBP",
              "price": (p.discountedPrice * 0.01).toFixed(2),
              "itemCondition": "https://schema.org/NewCondition",
              "availability": `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
              "url": href,
              "shippingDetails": [
                {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "4.00",
                    "currency": "GBP"
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "GB"
                  },
                  "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "transitTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 2,
                      "maxValue": 3,
                      "unitCode": "DAY"
                    },
                    "handlingTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 0,
                      "maxValue": 1,
                      "unitCode": "DAY"
                    }
                  },
                  "name": "Royal Mail Tracked 48",
                  "shippingLabel": "Royal Mail Tracked 48",
                  "shippingSettingsLink": origin + shippingInfoPagePathname
                },
                {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "5.00",
                    "currency": "GBP"
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "GB"
                  },
                  "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "transitTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 1,
                      "maxValue": 1,
                      "unitCode": "DAY"
                    },
                    "handlingTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 0,
                      "maxValue": 1,
                      "unitCode": "DAY"
                    }
                  },
                  "name": "Royal Mail Tracked 24",
                  "shippingLabel": "Royal Mail Tracked 24",
                  "shippingSettingsLink": origin + shippingInfoPagePathname
                }
              ],
              "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "GB",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 2,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn",
                "merchantReturnLink": `${origin}/terms/returns-refunds`
              }
            }
          },{
            "@type": "BreadcrumbList",
            "@context": "https://schema.org",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop",
                "item": `${origin}/shop`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": p.name,
                "item": href
              }
            ]
          }
        ]
      })
}