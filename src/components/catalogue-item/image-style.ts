// import { FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'
import { imageUrlPrefix } from '@misc'

export const getImageStyle = (name:string,ext:string) => `image-set(${['.avif','.webp',ext].map(e=>`url(${imageUrlPrefix}${name}${e}) type('image/${e === '.jpg' ? 'jpeg' : e.replace('.','').toLowerCase()}')`).join(', ')})`