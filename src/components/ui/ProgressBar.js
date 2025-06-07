// components/ui/ProgressBar.js
const ProgressBar = ({ completed, total, title }) => {
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-title">{title}</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;