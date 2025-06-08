import { useState } from 'react';

const FloatingActions = ({ 
  currentView, 
  onViewChange, 
  onShowJarvis,
  tasks,
  stats
}) => {
  const [isListening, setIsListening] = useState(false);

  const handleMilariClick = () => {
    // Abrir MILARI IA - UN SOLO BOTÓN para todo
    onShowJarvis();
  };

  // Detectar estado inteligente - simplificado y coherente con la app
  const getMilariStatus = () => {
    const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
    const overdueTask = tasks?.find(t => {
      if (!t.scheduled_time) return false;
      const taskDate = new Date(t.scheduled_time);
      const now = new Date();
      return taskDate < now && t.status === 'pending';
    });

    if (overdueTask) return { 
      type: 'urgent', 
      message: 'Urgente',
      icon: '🚨'
    };
    if (pendingTasks > 5) return { 
      type: 'warning', 
      message: `${pendingTasks} tareas`,
      icon: '⚠️'
    };
    if (currentView === 'pomodoro') return { 
      type: 'focus', 
      message: 'Enfocado',
      icon: '🎯'
    };
    return { 
      type: 'ready', 
      message: 'Listo',
      icon: '🧠'
    };
  };

  const milariStatus = getMilariStatus();

  return (
    <div className="floating-actions-milari">
      {/* UN SOLO BOTÓN MILARI IA - Ultra minimalista y coherente */}
      <button 
        className={`milari-main-button ${milariStatus.type} ${isListening ? 'listening' : ''}`}
        onClick={handleMilariClick}
        title={`MILARI IA - ${milariStatus.message}`}
      >
        <div className="milari-core">
          <div className="milari-ring"></div>
          <div className="milari-center">
            <span className="milari-icon">
              {isListening ? '🔴' : milariStatus.icon}
            </span>
          </div>
        </div>
        <div className="milari-label">MILARI IA</div>
      </button>

      {/* Indicador de estado súper minimalista */}
      <div className={`milari-status ${milariStatus.type}`}>
        <div className="status-dot"></div>
        <span className="status-text">{milariStatus.message}</span>
      </div>
    </div>
  );
};

export default FloatingActions;