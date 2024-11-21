import { FM_IMAGE_URL_PREFIX } from 'astro:env/client'

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
                <img src={`${FM_IMAGE_URL_PREFIX}${name}${e}`} />
                :
                <source srcset={`${FM_IMAGE_URL_PREFIX}${name}${e}`} />
            ))
        }
    </picture>
)

export default Image