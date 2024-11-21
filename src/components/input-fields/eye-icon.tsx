const EyeIcon = (p:{showPassword:boolean}) => (
    <svg viewBox="0 0 512 512" stroke="currentColor" fill="none" stroke-width="15" class='h-8 w-8'>
        <path d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 0 0-.27 16.59C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 0 0 0-16.47C428.89 172.28 347.8 112 255.66 112z" />
        <circle cx="256" cy="256" r="80" />
        <path d="M400 400L112 112" stroke-linecap="round" stroke="white" stroke-width="100" class={`${p.showPassword ? 'hidden' : 'inline'}`} />
        <path d="M400 400L112 112" stroke-linecap="round" class={`${p.showPassword ? 'hidden' : 'inline'}`} />
    </svg>
)

export default EyeIcon