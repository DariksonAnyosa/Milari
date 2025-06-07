import { useState } from 'react';

const TodayView = ({ selectedDate, tasks, stats, onAddTask, onToggleTask, onDeleteTask }) => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const todayTasks = tasks.filter(task => {
    const taskDate = task.scheduled_time ?
      new Date(task.scheduled_time).toISOString().split('T')[0] :
      new Date(task.created_at).toISOString().split('T')[0];
    return taskDate === todayString;
  });

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        displayTime: hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`,
        tasks: getTasksForHour(hour)
      });
    }
    return slots;
  };

  const getTasksForHour = (hour) => {
    return todayTasks.filter(task => {
      if (!task.scheduled_time) return false;
      const taskHour = new Date(task.scheduled_time).getHours();
      return taskHour === hour;
    });
  };

  const timeSlots = generateTimeSlots();
  const unscheduledTasks = todayTasks.filter(t => !t.scheduled_time || !t.scheduled_time.includes('T'));

  return (
    <div className="today-view-clean">
      {/* Timeline moderna */}
      <div className="timeline-modern">
        <div className="timeline-header-modern">
          <h3 className="timeline-title">Agenda del día</h3>
          <div className="timeline-indicator">
            <span className="current-time-dot"></span>
            <span className="time-now">
              {new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>

        <div className="timeline-content">
          {timeSlots.map((slot) => {
            const isCurrentHour = new Date().getHours() === slot.hour;
            
            return (
              <div 
                key={slot.hour} 
                className={`time-slot-modern ${isCurrentHour ? 'current' : ''}`}
              >
                <div className="time-marker">
                  <div className="time-text-modern">{slot.displayTime}</div>
                  <div className="time-line"></div>
                </div>

                <div className="slot-content">
                  {slot.tasks.length > 0 ? (
                    <div className="tasks-container">
                      {slot.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`task-item-modern ${task.status} priority-${task.priority}`}
                        >
                          <button 
                            className="task-check-modern"
                            onClick={() => onToggleTask(task.id)}
                          >
                            {task.status === 'completed' ? '✓' : '○'}
                          </button>

                          <div className="task-details">
                            <span className="task-title-modern">{task.text}</span>
                            {task.priority !== 'normal' && (
                              <span className={`priority-badge-modern ${task.priority}`}>
                                {task.priority}
                              </span>
                            )}
                          </div>

                          <button 
                            className="task-remove"
                            onClick={() => onDeleteTask(task.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-slot-modern">
                      <span>Libre</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tareas sin programar */}
      {unscheduledTasks.length > 0 && (
        <div className="unscheduled-section">
          <h4 className="unscheduled-title">Tareas sin programar</h4>
          <div className="unscheduled-grid">
            {unscheduledTasks.map((task) => (
              <div key={task.id} className={`unscheduled-item ${task.status}`}>
                <button 
                  className="task-check-modern"
                  onClick={() => onToggleTask(task.id)}
                >
                  {task.status === 'completed' ? '✓' : '○'}
                </button>
                <span className="task-title-modern">{task.text}</span>
                <button 
                  className="task-remove"
                  onClick={() => onDeleteTask(task.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayView;