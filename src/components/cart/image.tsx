import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client'

const Image = (
    p:{
        name:string;
        ext:string;
        alt:string;
        imageSize:number;
    }
) => (
    <picture>
        {
            [
                '.avif',
                p.ext
            ].map(e=>(
                e === p.ext ?
                <img 
                    src={`${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${p.name}_256x256${e}`} 
                    alt={p.alt} 
                    loading='lazy' 
                    width={p.imageSize}
                    height={p.imageSize}
                    class="object-cover object-center"
                />
                :
                <source srcset={`${PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX}${p.name}_256x256${e}`} type="image/avif" />
            ))
        }
    </picture>
)

export default Image