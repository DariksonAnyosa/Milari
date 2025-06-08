// components/modals/AddTaskModal.js
import { useState, useEffect } from 'react';

const AddTaskModal = ({ onClose, onAddTask, selectedDate }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [priority, setPriority] = useState('normal');

  // Configurar fecha por defecto al abrir el modal
  useEffect(() => {
    if (selectedDate) {
      // Formatear fecha para input date (YYYY-MM-DD)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setTaskDate(formattedDate);
    } else {
      // Si no hay fecha seleccionada, usar hoy
      const today = new Date().toISOString().split('T')[0];
      setTaskDate(today);
    }
  }, [selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      // Crear fecha completa combinando fecha y hora
      let scheduledDateTime = null;
      if (taskDate && taskTime) {
        scheduledDateTime = new Date(`${taskDate}T${taskTime}`);
      } else if (taskDate) {
        // Si solo hay fecha, programar para las 9:00 AM
        scheduledDateTime = new Date(`${taskDate}T09:00`);
      } else {
        // Fecha y hora actual como fallback
        scheduledDateTime = new Date();
      }

      onAddTask({
        text: taskTitle,
        title: taskTitle,
        scheduled_time: scheduledDateTime.toISOString(),
        priority: priority,
        status: 'pending',
        type: 'task',
        created_at: new Date().toISOString()
      });
      
      // Limpiar formulario
      setTaskTitle('');
      setTaskTime('');
      setPriority('normal');
    }
  };

  return (
    <div className="add-task-overlay" onClick={onClose}>
      <div className="add-task-modal glass-strong" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✨ Nueva tarea</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-content">
          <input 
            type="text" 
            className="task-input"
            placeholder="¿Qué necesitas hacer?"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            autoFocus
            required
          />
          
          <div className="form-row">
            <div className="input-group">
              <label>Fecha</label>
              <input 
                type="date" 
                className="date-input"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Hora (opcional)</label>
              <input 
                type="time" 
                className="time-input"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Prioridad</label>
            <select 
              className="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Chips de prioridad premium */}
          <div className="priority-indicator-modal">
            <div 
              className={`priority-chip low ${priority === 'low' ? 'selected' : ''}`}
              onClick={() => setPriority('low')}
            >
              🟢 Baja
            </div>
            <div 
              className={`priority-chip medium ${priority === 'normal' ? 'selected' : ''}`}
              onClick={() => setPriority('normal')}
            >
              🟡 Normal
            </div>
            <div 
              className={`priority-chip high ${priority === 'high' ? 'selected' : ''}`}
              onClick={() => setPriority('high')}
            >
              🟠 Alta
            </div>
            <div 
              className={`priority-chip urgent ${priority === 'urgent' ? 'selected' : ''}`}
              onClick={() => setPriority('urgent')}
            >
              🔴 Urgente
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={!taskTitle.trim()}
            >
              Crear tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;