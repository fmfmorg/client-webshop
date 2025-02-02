import { For } from 'solid-js'
import Option from './option';

const AttributeContainer = (p:{
    desktopHeaderLabelID:string;
    attributes:string[];
    desktopRadioInput:string;
    desktopULID:string;
}) => (
    <div>
        <input name='desktop-filter-attr' hidden type='radio' id={p.desktopRadioInput} class='filterattr peer' />
        <ul id={p.desktopULID} class="hidden peer-checked:flex flex flex-col flex-wrap max-h-full absolute top-0">
            <For 
                each={p.attributes}
                children={e=><Option attr={e} />}
            />
        </ul>
    </div>
)

export default AttributeContainer