const Textarea = (
    p:{
        id?:string;
        name?:string;
        className?:string;
        placeholder?:string;
        required?:boolean;
    }
) => {
    return (
        <textarea 
            {...!!p.required && {required:true}}
            class={`w-full text-black tracking-wider font-light placeholder-gray-600 focus:outline-none border-gray-300 border ${p.className || ''}`.trim()}
            rows='8'
            maxlength='2000'
            {...!!p.id && {id:p.id}}
            {...!!p.name && {id:p.name}}
            {...!!p.placeholder && {placeholder:p.placeholder}}
        />
    )
}

export default Textarea