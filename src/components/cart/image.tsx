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
                '.webp',
                ext
            ].map(e=>(
                e === ext ?
                <img src={`${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${name}_256x256${e}`} alt={alt} />
                :
                <source srcset={`${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${name}_256x256${e}`} />
            ))
        }
    </picture>
)

export default Image