// components/ui/StatsCard.js
const StatsCard = ({ icon, number, label, variant = 'default' }) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-number">{number}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatsCard;