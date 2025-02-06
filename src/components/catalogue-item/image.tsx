import { createMemo, useContext } from 'solid-js'
import { PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX } from 'astro:env/client';
import CatalogueItemContext from './context';


const Image = (p:{
    id:string;
    checked?:boolean;
    index:number;
    productPageKeyProduct:boolean;
    render:boolean;
    isProductPage:boolean;
}) => {
    const { productMap } = useContext(CatalogueItemContext)
    const productName = createMemo(()=>productMap[p.id].name)
    const filename = createMemo(()=>productMap[p.id].images.filter(e=>!!e.catalogue)[p.index].name)
    const ext = createMemo(()=>productMap[p.id].images.filter(e=>!!e.catalogue)[p.index].ext)
    const len = createMemo(()=>productMap[p.id].images.filter(e=>!!e.catalogue).length)
    const fullFilename = createMemo(()=>PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + filename())
    const sizes = createMemo(()=>p.productPageKeyProduct ? '100vw' : '(min-width: 1536px) 25vw, (min-width: 640px) 33vw, 50vw')
    const showRadio = createMemo(()=>productMap[p.id].images.filter(e=>!!e.catalogue).length > 1)
    
    return (
        <div
            data-product-page-key-product={p.productPageKeyProduct ? '1' : '0'}
            data-index={p.index}
            data-len={len()}
            class='carousel-image'
        >
            <input 
                type="radio" 
                name={p.id} 
                aria-label={filename()} 
                checked={p.checked} 
                disabled
                class={`peer appearance-none border border-gray-400 rounded-full checked:bg-gray-400 absolute ${p.productPageKeyProduct ? '-bottom-5 w-1.5 h-1.5 2xs:-bottom-8 2xs:w-2 2xs:h-2' : 'z-10 bottom-2 w-1 h-1 xs:w-1.5 xs:h-1.5 mouse:hidden'} ${showRadio() ? '' : 'hidden'}`.trim()} 
            />
            <div class={`carousel-image-container w-full h-full object-center object-cover absolute top-0 left-0 opacity-0 duration-500 peer-checked:opacity-100 ${!!p.index ? '[content-visibility: auto]' : ''}`.trim()}>
                <picture>
                    {['.avif',ext()].map(e=>(
                        <source 
                            srcset={`${fullFilename()}_256x256${e} 256w, ${fullFilename()}_768x768${e} 768w, ${fullFilename()}${e} 2048w`} 
                            type={e === '.jpg' ? 'image/jpeg' : `image/${e.replaceAll('.','')}`} 
                            sizes={sizes()}
                        />
                    ))}
                    <img 
                        src={`${fullFilename()}_768x768${ext()}`} 
                        srcset={`${fullFilename()}_768x768${ext()} 768w, ${fullFilename()}${ext()} 2048w`} 
                        sizes={sizes()}
                        alt={productName()} 
                        width={768}
                        height={768}
                        class="object-cover object-center"
                        // loading={((p.productPageKeyProduct || (p.render && !p.isProductPage)) && !p.index) ? 'eager' : 'lazy'}
                        loading={!!p.index ? 'lazy' : 'eager'}
                        fetchpriority={p.productPageKeyProduct && !p.index ? 'high' : 'auto'}
                    />
                </picture>
            </div>
        </div>
    )
}

export default Image