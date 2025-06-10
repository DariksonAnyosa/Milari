import SmartGreeting from '../ai/SmartGreeting';

const HeroSection = ({ selectedDate, stats, tasks, onAddTask, onShowAddTask }) => {
  const getSimpleMessage = () => {
    const completed = stats.completed;
    const total = stats.tasksToday;
    
    if (total === 0) return "¿Qué harás hoy?";
    if (completed === total && total > 0) return "¡Día completado!";
    if (completed > 0) return `${completed} de ${total} completadas`;
    return `${total} tareas pendientes`;
  };

  return (
    <div className="hero">
      <div className="hero-container">
        
        {/* Saludo Apple Style */}
        <div className="greeting">
          <h1 className="greeting-text">Hola, Darikson</h1>
          <p className="greeting-subtitle">{getSimpleMessage()}</p>
        </div>

        {/* Botón MILARI IA Principal */}
        <button className="milari-button" onClick={onShowAddTask}>
          <div className="milari-orb"></div>
          <span className="milari-text">Hablar con MILARI</span>
        </button>

        {/* Botón secundario para agregar tarea rápida */}
        <button 
          className="add-button-minimal"
          onClick={onShowAddTask}
        >
          Nueva tarea
        </button>

      </div>
    </div>
  );
};

export default HeroSection;