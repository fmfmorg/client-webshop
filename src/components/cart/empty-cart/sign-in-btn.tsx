import { createSignal, onMount } from 'solid-js'
import { whiteBtnClass } from "@misc"

const SignInBtn = () => {
    const [redirect,setRedirect] = createSignal('')

    onMount(()=>{
        const { pathname, search } = window.location
        setRedirect(encodeURIComponent(pathname + search))
    })

    return (
        <div>
            <p class='tracking-widest uppercase text-xs'>Sign in to access your items already saved in your shopping bag.</p>
            <a href={`/sign-in?rd=${redirect()}`} class={whiteBtnClass}>Sign In</a>
        </div>
    )
}

export default SignInBtn