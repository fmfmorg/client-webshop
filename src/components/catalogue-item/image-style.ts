// import { FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'
import { imageUrlPrefix } from '@misc'

export const getImageStyle = (name:string,ext:string,imageSize?:number) => `image-set(${['.avif','.webp',ext].map(e=>`url(${imageUrlPrefix}${name}${!!imageSize ? `_${imageSize}x${imageSize}` : ''}${e}) type('image/${e === '.jpg' ? 'jpeg' : e.replace('.','').toLowerCase()}')`).join(', ')})`