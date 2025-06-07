const FloatingActions = ({ 
  currentView, 
  onViewChange, 
  onShowVoiceAssistant, 
  onShowAddTask, 
  showAddTask 
}) => {
  return (
    <div className="floating-actions-modern">
      {/* Botón principal de agregar - Más prominente */}
      <button 
        className={`fab-primary ${showAddTask ? 'active' : ''}`}
        onClick={onShowAddTask}
        title="Agregar nueva tarea"
      >
        <span className="fab-icon">+</span>
      </button>

      {/* Botones secundarios - Más elegantes */}
      <div className="fab-secondary-group">
        <button 
          className="fab-secondary"
          onClick={onShowVoiceAssistant}
          title="Asistente de voz"
        >
          <span className="fab-icon-small">🎤</span>
        </button>
        
        <button 
          className="fab-secondary"
          onClick={() => onViewChange('calendar')}
          title="Ver calendario"
        >
          <span className="fab-icon-small">📅</span>
        </button>
        
        <button 
          className="fab-secondary"
          onClick={() => onViewChange('pomodoro')}
          title="Modo enfoque"
        >
          <span className="fab-icon-small">🍅</span>
        </button>
      </div>

      {/* Indicador de modo focus */}
      {currentView === 'pomodoro' && (
        <div className="focus-mode-indicator-fab">
          <span className="focus-pulse"></span>
          <span className="focus-text-fab">Enfocado</span>
        </div>
      )}
    </div>
  );
};

export default FloatingActions;