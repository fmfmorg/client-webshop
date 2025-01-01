import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'

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
                ext
            ].map(e=>(
                e === ext ?
                <img src={`${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${name}_256x256${e}`} alt={alt} loading='lazy' />
                :
                <source srcset={`${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${name}_256x256${e}`} type="image/avif" />
            ))
        }
    </picture>
)

export default Image