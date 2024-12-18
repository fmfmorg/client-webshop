// import { FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'
import { imageUrlPrefix } from '@misc'

const Image = (
    {
        name,
        ext,
        alt
    }:{
        name:string;
        ext:string;
        alt:string;
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
                <img src={`${imageUrlPrefix}${name}_256x256${e}`} alt={alt} />
                :
                <source srcset={`${imageUrlPrefix}${name}_256x256${e}`} />
            ))
        }
    </picture>
)

export default Image