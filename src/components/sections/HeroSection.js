import SmartGreeting from '../ai/SmartGreeting';

const HeroSection = ({ selectedDate, stats, tasks, onAddTask, onShowAddTask }) => {
  const getSimpleMessage = () => {
    const completed = stats.completed;
    const total = stats.tasksToday;
    
    if (total === 0) return "¿Qué harás hoy?";
    if (completed === total && total > 0) return "¡Día completado! 🎉";
    if (completed > 0) return `${completed} de ${total} completadas`;
    return `${total} tareas para hoy`;
  };

  const progressPercent = stats.tasksToday ? Math.round((stats.completed / stats.tasksToday) * 100) : 0;

  return (
    <div className="hero-ultra-minimal">
      <div className="hero-minimal-container">
        
        {/* Saludo con fecha */}
        <div className="minimal-greeting">
          <h1 className="greeting-text">Hola, Darikson</h1>
          <div className="greeting-date">
            {selectedDate.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <p className="greeting-subtitle">{getSimpleMessage()}</p>
        </div>

        {/* Progress Circular Minimalista */}
        {stats.tasksToday > 0 && (
          <div className="minimal-progress">
            <div className="circular-progress">
              <svg className="progress-ring" width="80" height="80">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#007AFF" />
                    <stop offset="100%" stopColor="#5856D6" />
                  </linearGradient>
                </defs>
                <circle
                  className="progress-ring-circle-bg"
                  cx="40"
                  cy="40"
                  r="32"
                />
                <circle
                  className="progress-ring-circle"
                  cx="40"
                  cy="40"
                  r="32"
                  style={{
                    strokeDasharray: `${progressPercent * 2.01} 201`,
                  }}
                />
              </svg>
              <div className="progress-percentage">{progressPercent}%</div>
            </div>
          </div>
        )}

        {/* Botón Principal Ultra Simple */}
        <button 
          className="minimal-add-button"
          onClick={onShowAddTask}
        >
          <span className="minimal-add-icon">+</span>
          <span className="minimal-add-text">Nueva tarea</span>
        </button>

      </div>
    </div>
  );
};

export default HeroSection;