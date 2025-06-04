import { useState } from 'react';

const TodayView = ({ selectedDate, tasks, stats, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('normal');
  const [showAddForm, setShowAddForm] = useState(false);

  // Filtrar tareas de hoy más inteligentemente
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(task => {
    // Incluir tareas programadas para hoy O creadas hoy
    const taskDate = task.scheduled_time ? 
      new Date(task.scheduled_time).toISOString().split('T')[0] : 
      new Date(task.created_at).toISOString().split('T')[0];
    return taskDate === todayString;
  });

  console.log('Tareas de hoy encontradas:', todayTasks);

  // Separar por estado y ordenar por prioridad
  const pendingTasks = todayTasks
    .filter(task => task.status === 'pending')
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
    });

  const completedTasks = todayTasks.filter(task => task.status === 'completed');

  // Tareas atrasadas (días anteriores)
  const overdueTasks = tasks.filter(task => {
    if (task.status !== 'pending' || !task.scheduled_time) return false;
    const taskDate = new Date(task.scheduled_time).toISOString().split('T')[0];
    return taskDate < todayString;
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    // Crear fecha con hora si se especificó
    let scheduledTime = new Date();
    if (newTaskTime) {
      const [hours, minutes] = newTaskTime.split(':');
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    await onAddTask({
      text: newTaskText,
      scheduled_time: scheduledTime.toISOString(),
      priority: newTaskPriority,
      type: detectTaskType(newTaskText)
    });

    setNewTaskText('');
    setNewTaskTime('');
    setNewTaskPriority('normal');
    setShowAddForm(false);
  };

  const detectTaskType = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('llamar') || lowerText.includes('call')) return 'call';
    if (lowerText.includes('reunión') || lowerText.includes('meeting')) return 'meeting';
    if (lowerText.includes('comprar') || lowerText.includes('shopping')) return 'shopping';
    if (lowerText.includes('estudiar') || lowerText.includes('aprender')) return 'study';
    if (lowerText.includes('ejercicio') || lowerText.includes('gym')) return 'fitness';
    return 'task';
  };

  const getTaskIcon = (type, priority) => {
    const icons = {
      call: '📞',
      meeting: '👥',
      shopping: '🛒',
      study: '📚',
      fitness: '💪',
      task: priority === 'urgent' ? '🔥' : priority === 'high' ? '⚡' : '✅'
    };
    return icons[type] || '✅';
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
        };
      case 'high':
        return {
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
        };
      case 'low':
        return {
          background: 'linear-gradient(135deg, #6b7280, #4b5563)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(107, 114, 128, 0.2)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
        };
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeFromNow = (dateString) => {
    const taskTime = new Date(dateString);
    const now = new Date();
    const diffMs = taskTime - now;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < -60) return 'Atrasada';
    if (diffMins < 0) return 'Hace ' + Math.abs(diffMins) + ' min';
    if (diffMins < 60) return 'En ' + diffMins + ' min';
    if (diffMins < 1440) return 'En ' + Math.round(diffMins/60) + 'h';
    return 'Mañana';
  };

  return (
    <div className="today-view-premium">
      {/* Header con estadísticas dinámicas */}
      <div className="today-header">
        <div className="header-main">
          <h1 className="today-title">
            <span className="day-emoji">
              {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
            </span>
            {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'}
          </h1>
          <p className="today-subtitle">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
        
        <div className="today-stats">
          <div className="stat-bubble pending">
            <span className="stat-number">{pendingTasks.length}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-bubble completed">
            <span className="stat-number">{completedTasks.length}</span>
            <span className="stat-label">Completadas</span>
          </div>
          {overdueTasks.length > 0 && (
            <div className="stat-bubble overdue">
              <span className="stat-number">{overdueTasks.length}</span>
              <span className="stat-label">Atrasadas</span>
            </div>
          )}
        </div>
      </div>

      {/* Botón de agregar tarea llamativo */}
      <div className="add-task-section">
        {!showAddForm ? (
          <button 
            className="add-task-trigger"
            onClick={() => setShowAddForm(true)}
          >
            <span className="add-icon">+</span>
            <span className="add-text">¿Qué necesitas hacer hoy?</span>
            <span className="add-arrow">→</span>
          </button>
        ) : (
          <form onSubmit={handleAddTask} className="add-task-form-premium">
            <div className="form-header">
              <h3>Nueva Tarea</h3>
              <button 
                type="button" 
                className="close-form"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="form-grid">
              <div className="input-group">
                <label>¿Qué necesitas hacer?</label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Ej: Llamar a mamá, Reunión con equipo..."
                  className="task-input-premium"
                  autoFocus
                />
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Hora (opcional)</label>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="time-input"
                  />
                </div>
                
                <div className="input-group">
                  <label>Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="priority-select-premium"
                  >
                    <option value="low">📝 Baja</option>
                    <option value="normal">✅ Normal</option>
                    <option value="high">⚡ Alta</option>
                    <option value="urgent">🔥 Urgente</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-add-premium">
                Agregar Tarea
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tareas atrasadas */}
      {overdueTasks.length > 0 && (
        <div className="tasks-section overdue">
          <h2 className="section-title">
            <span className="section-icon">⚠️</span>
            Tareas Atrasadas
            <span className="section-count">{overdueTasks.length}</span>
          </h2>
          <div className="tasks-list">
            {overdueTasks.map(task => (
              <div key={task.id} className="task-card overdue" style={getPriorityStyle(task.priority)}>
                <div className="task-header">
                  <button 
                    className="task-checkbox"
                    onClick={() => onToggleTask(task.id)}
                  >
                    <span className="checkbox-icon">○</span>
                  </button>
                  <span className="task-icon">{getTaskIcon(task.type, task.priority)}</span>
                  <button 
                    className="task-delete"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="task-content">
                  <h3 className="task-title">{task.text}</h3>
                  <div className="task-meta">
                    <span className="task-time-info">
                      {formatTime(task.scheduled_time)} • {getTimeFromNow(task.scheduled_time)}
                    </span>
                    <span className="task-priority-badge">{task.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tareas de hoy */}
      <div className="tasks-section today">
        <h2 className="section-title">
          <span className="section-icon">📋</span>
          Tareas de Hoy
          <span className="section-count">{pendingTasks.length}</span>
        </h2>
        
        {pendingTasks.length > 0 ? (
          <div className="tasks-list">
            {pendingTasks.map(task => (
              <div key={task.id} className="task-card pending" style={getPriorityStyle(task.priority)}>
                <div className="task-header">
                  <button 
                    className="task-checkbox"
                    onClick={() => onToggleTask(task.id)}
                  >
                    <span className="checkbox-icon">○</span>
                  </button>
                  <span className="task-icon">{getTaskIcon(task.type, task.priority)}</span>
                  <button 
                    className="task-delete"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="task-content">
                  <h3 className="task-title">{task.text}</h3>
                  <div className="task-meta">
                    <span className="task-time-info">
                      {task.scheduled_time && formatTime(task.scheduled_time)}
                      {task.scheduled_time && ' • '}
                      {task.scheduled_time ? getTimeFromNow(task.scheduled_time) : 'Sin hora'}
                    </span>
                    <span className="task-priority-badge">{task.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-premium">
            <div className="empty-illustration">🎉</div>
            <h3 className="empty-title">¡Excelente!</h3>
            <p className="empty-subtitle">No tienes tareas pendientes para hoy</p>
            <button 
              className="btn-add-empty"
              onClick={() => setShowAddForm(true)}
            >
              + Agregar nueva tarea
            </button>
          </div>
        )}
      </div>

      {/* Tareas completadas */}
      {completedTasks.length > 0 && (
        <div className="tasks-section completed">
          <h2 className="section-title">
            <span className="section-icon">✅</span>
            Completadas Hoy
            <span className="section-count">{completedTasks.length}</span>
          </h2>
          <div className="tasks-list">
            {completedTasks.map(task => (
              <div key={task.id} className="task-card completed">
                <div className="task-header">
                  <button 
                    className="task-checkbox completed"
                    onClick={() => onToggleTask(task.id)}
                  >
                    <span className="checkbox-icon">✓</span>
                  </button>
                  <span className="task-icon">{getTaskIcon(task.type, task.priority)}</span>
                </div>
                
                <div className="task-content">
                  <h3 className="task-title completed">{task.text}</h3>
                  <div className="task-meta">
                    <span className="completion-time">
                      Completada a las {formatTime(task.completed_at)}
                    </span>
                    {task.emotion && (
                      <span className="completion-emotion">{task.emotion}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayView;