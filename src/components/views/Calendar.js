import { useState } from 'react';

const Calendar = ({ selectedDate, onDateSelect, tasks, onAddTask, onToggleTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = firstDayOfWeek; i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date)
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        tasks: getTasksForDate(date)
      });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date)
      });
    }
    
    return days;
  };

  const getTasksForDate = (date) => {
    const dateString = date.toDateString();
    return tasks.filter(task => {
      const taskDate = task.scheduled_time ? 
        new Date(task.scheduled_time).toDateString() : 
        new Date(task.created_at).toDateString();
      return taskDate === dateString;
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
    setShowAddTask(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    await onAddTask({
      text: newTaskText,
      scheduled_time: selectedDate.toISOString(),
      priority: 'normal',
      type: 'task'
    });

    setNewTaskText('');
    setShowAddTask(false);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const calendarDays = generateCalendarDays();
  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="calendar-view">
      <div className="calendar-container">
        {/* Header del calendario */}
        <div className="calendar-header">
          <button 
            className="nav-arrow"
            onClick={() => navigateMonth(-1)}
          >
            ‹
          </button>
          <h2 className="calendar-title">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button 
            className="nav-arrow"
            onClick={() => navigateMonth(1)}
          >
            ›
          </button>
        </div>

        {/* Nombres de los días */}
        <div className="calendar-days-header">
          {dayNames.map(day => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
        </div>

        {/* Grid del calendario */}
        <div className="calendar-grid">
          {calendarDays.map((dayData, index) => {
            const { date, isCurrentMonth, tasks: dayTasks } = dayData;
            const pendingTasks = dayTasks.filter(t => t.status === 'pending');
            const completedTasks = dayTasks.filter(t => t.status === 'completed');
            
            return (
              <div
                key={index}
                className={`calendar-day ${
                  !isCurrentMonth ? 'other-month' : ''
                } ${
                  isToday(date) ? 'today' : ''
                } ${
                  isSelected(date) ? 'selected' : ''
                } ${
                  dayTasks.length > 0 ? 'has-tasks' : ''
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className="day-number">
                  {date.getDate()}
                </div>
                
                {/* Indicadores de tareas */}
                {dayTasks.length > 0 && (
                  <div className="task-indicators">
                    {pendingTasks.length > 0 && (
                      <div className="task-dot pending" title={`${pendingTasks.length} pendientes`}>
                        {pendingTasks.length}
                      </div>
                    )}
                    {completedTasks.length > 0 && (
                      <div className="task-dot completed" title={`${completedTasks.length} completadas`}>
                        ✓
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel lateral para el día seleccionado */}
      <div className="calendar-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            {selectedDate.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h3>
          <button 
            className="btn-primary"
            onClick={() => setShowAddTask(true)}
          >
            + Agregar
          </button>
        </div>

        {/* Formulario para agregar tarea */}
        {showAddTask && (
          <form onSubmit={handleAddTask} className="add-task-form sidebar-form">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Nueva tarea para este día"
              className="task-input"
              autoFocus
            />
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Agregar
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
        )}

        {/* Lista de tareas del día seleccionado */}
        {selectedDateTasks.length > 0 ? (
          <div className="day-tasks">
            <h4 className="tasks-subtitle">Tareas de este día:</h4>
            <div className="task-list sidebar-tasks">
              {selectedDateTasks.map(task => (
                <div key={task.id} className={`task-item ${task.status}`}>
                  <button 
                    className="task-checkbox"
                    onClick={() => onToggleTask(task.id)}
                  >
                    <span className="checkbox-icon">
                      {task.status === 'completed' ? '✓' : '○'}
                    </span>
                  </button>
                  <div className="task-content">
                    <div className="task-text">{task.text}</div>
                    <div className="task-meta">
                      <span className="task-time">
                        {new Date(task.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {task.priority !== 'normal' && (
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-day">
            <div className="empty-icon">📅</div>
            <div className="empty-text">No hay tareas para este día</div>
            <button 
              className="btn-secondary"
              onClick={() => setShowAddTask(true)}
            >
              Agregar la primera
            </button>
          </div>
        )}

        {/* Resumen rápido */}
        <div className="day-summary-quick">
          <div className="summary-item">
            <span className="summary-number">
              {selectedDateTasks.filter(t => t.status === 'pending').length}
            </span>
            <span className="summary-label">Pendientes</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">
              {selectedDateTasks.filter(t => t.status === 'completed').length}
            </span>
            <span className="summary-label">Completadas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;