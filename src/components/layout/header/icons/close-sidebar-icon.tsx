const CloseSidebarIcon = (p:{
    height?:string;
    strokeWidth?:string;
}) => (
    <svg viewBox="0 0 100 100" height={p.height || '2.5em'} stroke-linecap="round" stroke="black" stroke-width={p.strokeWidth || '0.2rem'}>
        <line x1="20" y1="20" x2="80" y2="80" />
        <line x1="20" y1="80" x2="80" y2="20" />
    </svg>
)

export default CloseSidebarIcon