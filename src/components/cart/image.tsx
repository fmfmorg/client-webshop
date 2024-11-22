// import { FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'
import { imageUrlPrefix } from '@misc'

const Image = (
    {
        name,
        ext
    }:{
        name:string;
        ext:string;
    }
) => (
    <picture>
        {
            [
                '.avif',
                '.webp',
                ext
            ].map(e=>(
                e === ext ?
                <img src={`${imageUrlPrefix}${name}${e}`} />
                :
                <source srcset={`${imageUrlPrefix}${name}${e}`} />
            ))
        }
    </picture>
)

export default Image