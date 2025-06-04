import { useState } from 'react';

const TaskList = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'name'
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar tareas
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Filtro por estado
    if (filter === 'pending') {
      filteredTasks = filteredTasks.filter(task => task.status === 'pending');
    } else if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.status === 'completed');
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar
    filteredTasks.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        return bPriority - aPriority;
      } else if (sortBy === 'name') {
        return a.text.localeCompare(b.text);
      } else {
        // Por fecha (más recientes primero)
        const aDate = new Date(a.scheduled_time || a.created_at);
        const bDate = new Date(b.scheduled_time || b.created_at);
        return bDate - aDate;
      }
    });

    return filteredTasks;
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    await onAddTask({
      text: newTaskText,
      priority: newTaskPriority,
      scheduled_time: new Date().toISOString(),
      type: 'task'
    });

    setNewTaskText('');
    setNewTaskPriority('normal');
    setShowAddTask(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ef4444';
      case 'low': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return '👥';
      case 'reminder': return '⏰';
      case 'study': return '📚';
      case 'shopping': return '🛒';
      default: return '✅';
    }
  };

  const filteredTasks = getFilteredTasks();
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="tasklist-view">
      {/* Header con controles */}
      <div className="tasklist-header">
        <div className="header-section">
          <h2 className="section-title">Todas las Tareas</h2>
          <button 
            className="btn-primary"
            onClick={() => setShowAddTask(!showAddTask)}
          >
            + Nueva Tarea
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">Completadas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Formulario para agregar tarea */}
      {showAddTask && (
        <div className="add-task-section">
          <form onSubmit={handleAddTask} className="add-task-form expanded">
            <div className="form-row">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="¿Qué necesitas hacer?"
                className="task-input"
                autoFocus
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="priority-select"
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Agregar Tarea
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowAddTask(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controles de filtro y búsqueda */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Mostrar:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Fecha</option>
              <option value="priority">Prioridad</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de tareas */}
      {filteredTasks.length > 0 ? (
        <div className="tasks-grid">
          {filteredTasks.map(task => (
            <div key={task.id} className={`task-card ${task.status}`}>
              <div className="task-card-header">
                <button 
                  className="task-checkbox large"
                  onClick={() => onToggleTask(task.id)}
                >
                  <span className="checkbox-icon">
                    {task.status === 'completed' ? '✓' : '○'}
                  </span>
                </button>
                
                <div className="task-type-icon">
                  {getTypeIcon(task.type)}
                </div>

                <button 
                  className="task-delete"
                  onClick={() => onDeleteTask(task.id)}
                  title="Eliminar tarea"
                >
                  ✕
                </button>
              </div>

              <div className="task-card-content">
                <div className="task-text">{task.text}</div>
                
                {task.notes && (
                  <div className="task-notes">{task.notes}</div>
                )}

                <div className="task-card-meta">
                  <div className="meta-left">
                    <span className="task-date">
                      {formatDate(task.scheduled_time || task.created_at)}
                    </span>
                    <span className="task-time">
                      {new Date(task.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="meta-right">
                    {task.priority !== 'normal' && (
                      <span 
                        className="priority-badge"
                        style={{ 
                          backgroundColor: getPriorityColor(task.priority) + '20',
                          color: getPriorityColor(task.priority),
                          border: `1px solid ${getPriorityColor(task.priority)}40`
                        }}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>

                {task.status === 'completed' && task.emotion && (
                  <div className="completion-info">
                    <span className="completion-emotion">{task.emotion}</span>
                    <span className="completion-time">
                      Completada {formatDate(task.completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            {searchTerm ? '🔍' : filter === 'completed' ? '🎉' : '📝'}
          </div>
          <div className="empty-title">
            {searchTerm 
              ? 'No se encontraron tareas'
              : filter === 'completed' 
                ? '¡No hay tareas completadas aún!'
                : filter === 'pending'
                  ? '¡Todas las tareas están completadas!'
                  : 'No hay tareas creadas'
            }
          </div>
          <div className="empty-subtitle">
            {searchTerm 
              ? `No hay tareas que coincidan con "${searchTerm}"`
              : filter === 'pending'
                ? 'Crea una nueva tarea para empezar'
                : 'Comienza agregando tu primera tarea'
            }
          </div>
          {!searchTerm && (
            <button 
              className="btn-primary"
              onClick={() => setShowAddTask(true)}
            >
              + Crear Primera Tarea
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;