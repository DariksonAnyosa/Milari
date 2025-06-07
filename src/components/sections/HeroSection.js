import useGreeting from '../../hooks/useGreeting';
import useTime from '../../hooks/useTime';

const HeroSection = ({ selectedDate, stats, onAddTask }) => {
  const greeting = useGreeting();

  const getMotivationalMessage = () => {
    const completed = stats.completed;
    const total = stats.tasksToday;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    if (total === 0) return "¡Es un nuevo día lleno de posibilidades!";
    if (percentage === 100) return "¡Increíble! Has completado todas tus tareas 🎉";
    if (percentage >= 80) return "¡Excelente progreso! Ya casi terminas 💪";
    if (percentage >= 50) return "¡Vas por buen camino! Sigue así 🚀";
    if (percentage >= 25) return "Un paso a la vez, tú puedes 💙";
    return "¡Comencemos! Cada gran logro empieza con una acción 🌟";
  };

  return (
    <div className="hero-section-clean">
      <div className="hero-container-clean">
        {/* Tarjeta principal con saludo y stats integradas */}
        <div className="main-card">
          <div className="card-header">
            <h2 className="greeting-title-clean">{greeting}</h2>
            <div className="motivational-text">
              {getMotivationalMessage()}
            </div>
          </div>

          {/* Stats integradas horizontalmente */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number-clean">{stats.tasksToday}</span>
              <span className="stat-label-clean">Tareas</span>
            </div>
            <div className="stat-divider-clean"></div>
            <div className="stat-item">
              <span className="stat-number-clean">{stats.completed}</span>
              <span className="stat-label-clean">Completadas</span>
            </div>
            <div className="stat-divider-clean"></div>
            <div className="stat-item">
              <span className="stat-number-clean">{stats.pending}</span>
              <span className="stat-label-clean">Pendientes</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-header-clean">
              <span className="progress-label">Progreso del día</span>
              <span className="progress-percent">
                {stats.tasksToday ? Math.round((stats.completed / stats.tasksToday) * 100) : 0}%
              </span>
            </div>
            <div className="progress-bar-clean">
              <div 
                className="progress-fill-clean"
                style={{ 
                  width: `${stats.tasksToday ? (stats.completed / stats.tasksToday) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Botón de agregar tarea prominente */}
          <button 
            className="add-task-primary"
            onClick={() => {/* Función para abrir modal */}}
          >
            <span className="add-icon">+</span>
            <span className="add-text">Agregar nueva tarea</span>
            <span className="add-shortcut">⌘N</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;