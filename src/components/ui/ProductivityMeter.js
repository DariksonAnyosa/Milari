// components/ui/ProductivityMeter.js
const ProductivityMeter = ({ percentage, level, compact = false }) => {
  return (
    <div className={`productivity-meter ${compact ? 'compact' : ''}`}>
      <div className={`meter-circle ${level}`}></div>
      <span>{percentage}%</span>
    </div>
  );
};

export default ProductivityMeter;