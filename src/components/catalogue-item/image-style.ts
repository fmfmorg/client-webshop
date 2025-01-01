import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'

export const getImageStyle = (name:string,ext:string,imageSize?:number) => `image-set(${['.avif',ext].map(e=>`url(${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${name}${!!imageSize ? `_${imageSize}x${imageSize}` : ''}${e}) type('image/${e === '.jpg' ? 'jpeg' : e.replace('.','').toLowerCase()}')`).join(', ')})`