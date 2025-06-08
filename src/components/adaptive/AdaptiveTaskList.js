import { useState, useEffect } from 'react';
import useAdaptiveMode from '../../hooks/useAdaptiveMode';

const AdaptiveTaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  const { currentMode, modeConfig, getFilteredTasks } = useAdaptiveMode();
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const filtered = getFilteredTasks(tasks, currentMode);
    setFilteredTasks(filtered);
  }, [tasks, currentMode, getFilteredTasks]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'creative': return '🎨';
      case 'administrative': return '📋';
      case 'meeting': return '🤝';
      case 'planning': return '📝';
      default: return '📌';
    }
  };

  const getModeSpecificMessage = () => {
    if (filteredTasks.length === 0) {
      switch (currentMode) {
        case 'morning':
          return '🌅 ¡Perfecto! No tienes tareas urgentes. Tiempo ideal para trabajo profundo.';
        case 'afternoon':
          return '☀️ Sin tareas administrativas pendientes. ¡Buen momento para colaborar!';
        case 'evening':
          return '🌙 Excelente día. Es hora de planificar el mañana.';
        default:
          return '✨ Todo está bajo control. ¡Sigue así!';
      }
    }

    return `${modeConfig.icon} Mostrando ${filteredTasks.length} tareas relevantes para ${modeConfig.name.toLowerCase()}`;
  };

  return (
    <div 
      className="adaptive-task-list"
      style={{ '--mode-primary': modeConfig.primaryColor, '--mode-secondary': modeConfig.secondaryColor }}
    >
      <div className="adaptive-task-header">
        <h3 className="task-list-title">
          {modeConfig.icon} Tareas para {modeConfig.name}
        </h3>
        <p className="task-list-subtitle">
          {getModeSpecificMessage()}
        </p>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="adaptive-tasks">
          {filteredTasks.map((task, index) => (
            <div 
              key={task.id || index}
              className={`adaptive-task-item ${task.status === 'completed' ? 'completed' : ''}`}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="task-main-content">
                <button
                  className="task-checkbox"
                  onClick={() => onToggleTask(task.id)}
                  disabled={task.status === 'completed'}
                >
                  {task.status === 'completed' ? '✅' : '⚪'}
                </button>

                <div className="task-info">
                  <div className="task-text">
                    {task.text || task.title}
                  </div>
                  
                  <div className="task-metadata">
                    <span className="task-priority">
                      {getPriorityIcon(task.priority)}
                    </span>
                    <span className="task-type">
                      {getTaskTypeIcon(task.type)}
                    </span>
                    {task.scheduled_time && (
                      <span className="task-time">
                        📅 {new Date(task.scheduled_time).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="task-actions">
                {task.status !== 'completed' && (
                  <button
                    className="task-action-btn complete"
                    onClick={() => onToggleTask(task.id)}
                    title="Completar tarea"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="task-action-btn delete"
                  onClick={() => onDeleteTask(task.id)}
                  title="Eliminar tarea"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">{modeConfig.icon}</div>
          <div className="empty-title">
            {currentMode === 'morning' && '¡Mañana despejada!'}
            {currentMode === 'afternoon' && '¡Tarde organizada!'}
            {currentMode === 'evening' && '¡Noche tranquila!'}
          </div>
          <div className="empty-message">
            {getModeSpecificMessage()}
          </div>
        </div>
      )}

      {/* Sugerencias específicas del modo */}
      <div className="mode-suggestions">
        <h4 className="suggestions-title">💡 Sugerencias para este momento</h4>
        <div className="suggestions-list">
          {modeConfig.suggestions && modeConfig.suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              • {suggestion}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveTaskList;