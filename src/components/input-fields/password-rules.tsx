interface IPasswordRule {
    msg:string;
    re:RegExp;
}

export const passwordRules:IPasswordRule[] = [
    {
        msg:'Include a minimum of 8 and a maximum of 20 characters',
        re:/.{8,20}/
    },
    {
        msg:'Does not contain spaces',
        re:/^\S*$/
    },
    {
        msg:'Contain at least a lower case, an upper case letter and a number',
        re:/^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,}).{0,}$/
    },
    {
        msg:'Contain at least one of the following symbols:\n!?<>/@#$%^&*()~=-_+.,',
        re:/^(?=(.*[!?<>/@#$%^&*()~`=\-_+.,]){1,}).{0,}$/
    }
]