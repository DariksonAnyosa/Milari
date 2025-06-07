import { useState, useEffect } from 'react';

const Calendar = ({ selectedDate, tasks, onDateSelect, onAddTask, onToggleTask, onDeleteTask }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [selectedDay, setSelectedDay] = useState(selectedDate);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  // Helpers para fechas sin dependencias
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Generar días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Navegación de mes
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Obtener tareas para un día específico
  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      const taskDate = task.scheduled_time ? 
        new Date(task.scheduled_time) : 
        new Date(task.created_at);
      
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Obtener estadísticas del día
  const getDayStats = (day) => {
    const dayTasks = getTasksForDay(day);
    const completed = dayTasks.filter(task => task.status === 'completed').length;
    const total = dayTasks.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      completed,
      pending: total - completed,
      completionRate: Math.round(completionRate)
    };
  };

  // Verificar si es el día de hoy
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Verificar si es el día seleccionado
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Manejar selección de día
  const handleDayClick = (day) => {
    setSelectedDay(day);
    onDateSelect(day);
  };

  // Agregar tarea al día seleccionado
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    let scheduledTime = new Date(selectedDay);
    if (newTaskTime) {
      const [hours, minutes] = newTaskTime.split(':');
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    await onAddTask({
      text: newTaskText,
      scheduled_time: scheduledTime.toISOString(),
      priority: 'normal',
      type: 'task'
    });

    setNewTaskText('');
    setNewTaskTime('');
    setShowTaskForm(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const selectedDayTasks = getTasksForDay(selectedDay);
  const selectedDayStats = getDayStats(selectedDay);

  return (
    <div className="calendar-view-premium">
      <div className="calendar-container">
        {/* Calendar Grid */}
        <div className="calendar-main">
          {/* Header del calendario */}
          <div className="calendar-header-premium">
            <button 
              className="month-nav-btn"
              onClick={goToPreviousMonth}
            >
              ‹
            </button>
            
            <h2 className="month-title">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            
            <button 
              className="month-nav-btn"
              onClick={goToNextMonth}
            >
              ›
            </button>
          </div>

          {/* Días de la semana */}
          <div className="weekdays-grid">
            {dayNamesShort.map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="calendar-grid-premium">
            {daysInMonth.map((day) => {
              const dayStats = getDayStats(day);
              const isSelected = isSameDay(day, selectedDay);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-day-premium ${
                    isSelected ? 'selected' : ''
                  } ${
                    isCurrentDay ? 'today' : ''
                  } ${
                    dayStats.total > 0 ? 'has-tasks' : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-number">
                    {day.getDate()}
                  </div>
                  
                  {dayStats.total > 0 && (
                    <div className="day-indicators">
                      <div className="task-dots">
                        {Array.from({ length: Math.min(dayStats.total, 3) }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`task-dot ${
                              i < dayStats.completed ? 'completed' : 'pending'
                            }`}
                          />
                        ))}
                        {dayStats.total > 3 && (
                          <div className="task-dot-more">+{dayStats.total - 3}</div>
                        )}
                      </div>
                      
                      {dayStats.completionRate === 100 && dayStats.total > 0 && (
                        <div className="perfect-day">✓</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar con detalles del día */}
        <div className="calendar-sidebar">
          <div className="selected-day-card">
            <div className="selected-day-header">
              <h3 className="selected-day-title">
                {dayNames[selectedDay.getDay()]}, {selectedDay.getDate()} de {monthNames[selectedDay.getMonth()]}
              </h3>
              
              {selectedDayStats.total > 0 && (
                <div className="day-progress-mini">
                  <div className="progress-circle-mini">
                    <div 
                      className="progress-fill-circle"
                      style={{ 
                        background: `conic-gradient(#10b981 ${selectedDayStats.completionRate}%, #e5e7eb 0%)` 
                      }}
                    >
                      <div className="progress-inner">
                        {selectedDayStats.completionRate}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats del día */}
            <div className="day-stats-row">
              <div className="day-stat">
                <span className="stat-number-day">{selectedDayStats.total}</span>
                <span className="stat-label-day">Total</span>
              </div>
              <div className="day-stat">
                <span className="stat-number-day">{selectedDayStats.completed}</span>
                <span className="stat-label-day">Hechas</span>
              </div>
              <div className="day-stat">
                <span className="stat-number-day">{selectedDayStats.pending}</span>
                <span className="stat-label-day">Pendientes</span>
              </div>
            </div>

            {/* Botón para agregar tarea */}
            <button 
              className="add-task-calendar-btn"
              onClick={() => setShowTaskForm(true)}
            >
              <span className="add-icon-calendar">+</span>
              Agregar tarea
            </button>
          </div>

          {/* Lista de tareas del día */}
          {selectedDayTasks.length > 0 ? (
            <div className="day-tasks-list">
              <h4 className="tasks-title">Tareas del día</h4>
              <div className="tasks-container-calendar">
                {selectedDayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`task-item-calendar ${task.status}`}
                  >
                    <button 
                      className="task-checkbox-calendar"
                      onClick={() => onToggleTask(task.id)}
                    >
                      {task.status === 'completed' ? '✓' : '○'}
                    </button>
                    
                    <div className="task-content-calendar">
                      <span className="task-text-calendar">{task.text}</span>
                      {task.scheduled_time && (
                        <span className="task-time-calendar">
                          {new Date(task.scheduled_time).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      className="task-delete-calendar"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-tasks-message">
              <div className="empty-state-icon">📅</div>
              <p>No hay tareas programadas para este día</p>
              <button 
                className="quick-add-btn"
                onClick={() => setShowTaskForm(true)}
              >
                Agregar la primera
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar tarea */}
      {showTaskForm && (
        <div className="task-form-overlay" onClick={() => setShowTaskForm(false)}>
          <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAddTask}>
              <div className="form-header-calendar">
                <h3>Nueva tarea para {selectedDay.getDate()} de {monthNames[selectedDay.getMonth()]}</h3>
                <button 
                  type="button"
                  className="close-form-btn"
                  onClick={() => setShowTaskForm(false)}
                >
                  ×
                </button>
              </div>

              <div className="form-content-calendar">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="¿Qué necesitas hacer?"
                  className="task-input-calendar"
                  autoFocus
                />

                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="time-input-calendar"
                />
              </div>

              <div className="form-actions-calendar">
                <button type="submit" className="submit-task-btn">
                  Agregar tarea
                </button>
                <button 
                  type="button"
                  className="cancel-task-btn"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;