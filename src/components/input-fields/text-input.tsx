import { checkoutGuestSignUp } from "@stores";
import EyeIcon from "./eye-icon";
import { passwordRules } from "./password-rules";
import { onMount, onCleanup, createSignal } from 'solid-js'
import { TEXT_INPUT_SET_NEW_VALUE } from "@misc/event-keys";

const Input = (
    p:{
        type:'text'|'email'|'password'|'number';
        placeholder:string;
        required?:boolean;
        id:string;
        name:string;
        className:string;
        showPasswordRules?:boolean;
        idPrefix?:string;
        pattern?:string;
        value?:string;
        maxLength?:number;
        highlightLabel?:boolean;
    }
) => {
  let ref
  const [isCheckoutGuestSignUpField, setCheckoutGuestSignUpField] = createSignal(false)
  const [value, setValue] = createSignal(!!p.value ? p.value : '');
  const [isFocused, setIsFocused] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [guestSignUp,setGuestSignUp] = createSignal(false)
  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const onFocus = () => setIsFocused(true)
  const onBlur = () => setIsFocused(false)
  const onInput = (e:SubmitEvent) => setValue((e.target as HTMLInputElement).value)
  const onSetNewValue = (e:CustomEvent) => {
    const { id:_id, value:_value } = e.detail as {id:string;value:string;}
    if (_id === (!!p.idPrefix ? `${p.idPrefix}-${p.id}` : p.id)) setValue(_value as string)
  }
  
    onMount(()=>{
      if (window.location.pathname === '/checkout' && p.id === "guest-sign-up-password") {
        setCheckoutGuestSignUpField(true)
        checkoutGuestSignUp.subscribe(v=>setGuestSignUp(v))
      }

      const errorMsgElem = document.getElementById(`${p.idPrefix}-error-message`)
      const hideErrorMsg = () => {
        if (!!errorMsgElem && errorMsgElem.classList.contains('visible')){
          errorMsgElem.classList.add('invisible')
          errorMsgElem.classList.remove('visible')
        }
      }

      document.addEventListener(TEXT_INPUT_SET_NEW_VALUE,onSetNewValue)
      if (!!errorMsgElem){
        ref.addEventListener('input',hideErrorMsg,true)
        ref.addEventListener('keydown',hideErrorMsg,true)
      }

      onCleanup(()=>{
        document.removeEventListener(TEXT_INPUT_SET_NEW_VALUE,onSetNewValue)
        if (!!errorMsgElem){
          ref.removeEventListener('input',hideErrorMsg,true)
          ref.removeEventListener('keydown',hideErrorMsg,true)
        }
      })
    })

  return (
    <div class={`${p.className} ${isCheckoutGuestSignUpField() ? guestSignUp() ? '' : 'hidden' : '' }`.trim()}>
      <div class="relative border-b border-gray-300">
        <input
          ref={ref}
          type={p.type === 'password' ? showPassword() ? 'text' : 'password' : p.type}
          id={!!p.idPrefix ? `${p.idPrefix}-${p.id}` : p.id}
          name={p.name}
          {...!!p.pattern && {pattern:p.pattern}}
          required={isCheckoutGuestSignUpField() ? guestSignUp() && p.required : !!p.required}
          class={`h-10 w-full text-black tracking-wider font-light placeholder-transparent focus:outline-none ${p.type==='password' && 'pr-10'}`}
          onInput={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={p.value || ''}
          {...!!p.maxLength && {maxLength:p.maxLength}}
        />
        {p.type==='password' && 
        <div class="absolute right-0 top-0 py-1 pl-2 cursor-pointer" onClick={toggleShowPassword}>
          <EyeIcon showPassword={showPassword()} />
        </div>
        }
        <label
          for={!!p.idPrefix ? `${p.idPrefix}-${p.id}` : p.id}
          class={`absolute left-0 transition-all tracking-wider ${isFocused() || !!value().length ? `-top-3.5 text-xs text-black cursor-pointer ${p.highlightLabel ? 'bg-white px-1 -left-1 font-semibold' : 'font-light'}` : `top-2 cursor-text text-gray-600 ${p.highlightLabel ? 'font-normal' : 'font-light'}`}`.trim()}
        >
          {`${p.placeholder}${p.required ? ' *' : ''}`}
        </label>
      </div>
      {p.type === 'password' && p.showPasswordRules &&
      <ul class='ml-3 mt-3'>
        {
          passwordRules.map(({re,msg})=>(
            <li class={`text-xs tracking-wider whitespace-pre-line ${value().match(re) ? 'list-image-[url(/password-rule-yes.svg)]' : 'list-image-[url(/password-rule-no.svg)]'} mb-1 ${value().match(re) ? 'text-cyan-500' : 'text-gray-400'}`}>{msg}</li>
          ))
        }
      </ul>
      }
    </div>
  );
};

export default Input;