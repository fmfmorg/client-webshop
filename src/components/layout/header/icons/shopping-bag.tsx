const ShoppingBag = (p:{className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" class={p.className || "scale-90 md:scale-100"}>
        <use href="#shopping-bag-svg" />
    </svg>
)

export default ShoppingBag