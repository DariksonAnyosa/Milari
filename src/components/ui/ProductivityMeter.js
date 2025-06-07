// components/ui/ProductivityMeter.js
const ProductivityMeter = ({ percentage, level }) => {
  return (
    <div className="productivity-meter">
      <div className={`meter-circle ${level}`}></div>
      <span>{percentage}%</span>
    </div>
  );
};

export default ProductivityMeter;