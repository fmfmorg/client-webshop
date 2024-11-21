import { FM_IMAGE_URL_PREFIX } from 'astro:env/client'

export const getImageStyle = (name:string,ext:string) => `image-set(${['.avif','.webp',ext].map(e=>`url(${FM_IMAGE_URL_PREFIX}${name}${e}) type('image/${e === '.jpg' ? 'jpeg' : e.replace('.','').toLowerCase()}')`).join(', ')})`