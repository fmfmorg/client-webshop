const DiscountRow = (p:{
    text:string;
    discountAmount:string;
}) => (
    <div class='table-row'>
        <div class='table-cell'>{p.text}</div>
        <div class='table-cell text-right text-red-700 font-semibold'>{p.discountAmount}</div>
    </div>
)

export default DiscountRow