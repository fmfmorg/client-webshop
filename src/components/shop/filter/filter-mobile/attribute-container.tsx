import { For } from 'solid-js'
import FilterMobileAttributeOption from './option';

const AttributeContainer = (p:{
    attrName:string;
    attributes:string[];
    hidden:boolean;
}) => {
    return (
        <ul classList={{hidden:p.hidden}} class="list-inside p-2">
            <For 
                each={p.attributes}
                children={e=>(<FilterMobileAttributeOption attr={e} />)}
            />
        </ul>
    )
}

export default AttributeContainer