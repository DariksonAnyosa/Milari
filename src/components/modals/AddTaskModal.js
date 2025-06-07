// components/modals/AddTaskModal.js
import { useState } from 'react';

const AddTaskModal = ({ onClose, onAddTask }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [priority, setPriority] = useState('normal');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onAddTask({
        title: taskTitle,
        time: taskTime,
        priority: priority,
        date: new Date()
      });
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
          />
          
          <div className="form-row">
            <div className="input-group">
              <label>Hora</label>
              <input 
                type="time" 
                className="time-input"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
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
          </div>

          {/* Chips de prioridad premium */}
          <div className="priority-indicator-modal">
            <div 
              className={`priority-chip low ${priority === 'low' ? 'selected' : ''}`}
              onClick={() => setPriority('low')}
            >
              Baja
            </div>
            <div 
              className={`priority-chip medium ${priority === 'normal' ? 'selected' : ''}`}
              onClick={() => setPriority('normal')}
            >
              Media
            </div>
            <div 
              className={`priority-chip high ${priority === 'high' ? 'selected' : ''}`}
              onClick={() => setPriority('high')}
            >
              Alta
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