const HeroSection = ({ selectedDate, stats, tasks, onAddTask, onShowAddTask, onShowVoice }) => {
  const getSimpleMessage = () => {
    const completed = stats.completed;
    const total = stats.tasksToday;
    
    if (total === 0) return "¿Qué harás hoy?";
    if (completed === total && total > 0) return "Día completado";
    if (completed > 0) return `${completed} de ${total} completadas`;
    return `${total} tareas pendientes`;
  };

  return (
    <div className="hero">
      <div className="hero-container">
        
        {/* Saludo limpio */}
        <div className="greeting">
          <h1 className="greeting-text">Hola, Darikson</h1>
          <p className="greeting-subtitle">{getSimpleMessage()}</p>
        </div>

        {/* Botón MILARI IA Principal - Solo texto */}
        <button className="milari-button" onClick={onShowVoice}>
          <div className="milari-orb">
            <div className="orb-pulse"></div>
          </div>
          <span className="milari-text">Hablar con MILARI</span>
        </button>

        {/* Botón secundario limpio */}
        <button 
          className="add-button-minimal"
          onClick={() => {
            console.log('📝 Click en Nueva tarea');
            onShowAddTask();
          }}
        >
          Nueva tarea
        </button>

      </div>
    </div>
  );
};

export default HeroSection;
