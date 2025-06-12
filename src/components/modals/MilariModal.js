import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { getDB } from '../../database/DatabaseManager';

const MilariModal = ({ onClose, onTaskAdded, selectedDate, tasks, stats, currentView, darkMode }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);

  console.log('🔍 MilariModal renderizado');

  const db = getDB();

  useEffect(() => {
    // Configurar fecha por defecto
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setTaskDate(formattedDate);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTaskDate(today);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleManualSubmit = useCallback(async (e) => {
    console.log('📤 Enviando formulario...');
    e.preventDefault();
    if (taskTitle.trim()) {
      setIsSubmitting(true);
      try {
        let scheduledDateTime = null;
        if (taskDate && taskTime) {
          scheduledDateTime = new Date(`${taskDate}T${taskTime}`);
        } else if (taskDate) {
          scheduledDateTime = new Date(`${taskDate}T09:00`);
        } else {
          scheduledDateTime = new Date();
        }

        const taskData = {
          text: taskTitle,
          title: taskTitle,
          scheduled_time: scheduledDateTime.toISOString(),
          priority: priority,
          status: 'pending',
          type: 'task',
          created_at: new Date().toISOString()
        };

        await db.addTask(taskData);
        
        setResponseMessage({
          type: 'success',
          message: `Tarea "${taskTitle}" agregada exitosamente`
        });
        
        // Limpiar formulario
        setTaskTitle('');
        setTaskTime('');
        setPriority('normal');
        
        onTaskAdded();
        
        // Limpiar mensaje después de 2 segundos
        setTimeout(() => {
          setResponseMessage(null);
        }, 2000);
        
      } catch (error) {
        setResponseMessage({
          type: 'error',
          message: 'Error agregando la tarea'
        });
        
        // Limpiar mensaje de error después de 3 segundos
        setTimeout(() => {
          setResponseMessage(null);
        }, 3000);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [taskTitle, taskDate, taskTime, priority, db, onTaskAdded]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const modalContent = (
    <div 
      className="milari-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        className="milari-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="milari-modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Sparkles size={24} strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h2 id="modal-title" className="modal-title">Planifica con MILARI</h2>
              <p id="modal-description" className="modal-description">
                Describe tu tarea y te ayudo a organizarla
              </p>
            </div>
          </div>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <div className="milari-modal-content">
          <form onSubmit={handleManualSubmit} className="task-form">
            
            {/* Task Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-input">
                Que necesitas hacer?
              </label>
              <input 
                id="task-input"
                type="text" 
                className="task-input-field"
                placeholder="Ej: Revisar propuesta del cliente, Preparar presentacion..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            
            {/* Date and Time Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-date">
                  Fecha
                </label>
                <input 
                  id="task-date"
                  type="date" 
                  className="date-time-input"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="task-time">
                  Hora (opcional)
                </label>
                <input 
                  id="task-time"
                  type="time" 
                  className="date-time-input"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                />
              </div>
            </div>

            {/* Priority Section */}
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <div className="priority-options" role="radiogroup" aria-label="Seleccionar prioridad">
                {[
                  { key: 'low', label: 'Baja', color: 'success' },
                  { key: 'normal', label: 'Normal', color: 'primary' },
                  { key: 'high', label: 'Alta', color: 'warning' },
                  { key: 'urgent', label: 'Urgente', color: 'danger' }
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`priority-option priority-option--${p.color} ${
                      priority === p.key ? 'priority-option--selected' : ''
                    }`}
                    onClick={() => setPriority(p.key)}
                    role="radio"
                    aria-checked={priority === p.key}
                  >
                    <span className="priority-label">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              {responseMessage?.type === 'success' ? (
                <>
                  <button 
                    type="button"
                    className="button button--secondary"
                    onClick={() => {
                      setResponseMessage(null);
                      setTaskTitle('');
                      setTaskTime('');
                      setPriority('normal');
                    }}
                  >
                    Agregar otra
                  </button>
                  <button 
                    type="button"
                    className="button button--primary"
                    onClick={onClose}
                  >
                    Finalizar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button"
                    className="button button--secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="button button--primary"
                    disabled={!taskTitle.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner" aria-hidden="true"></span>
                        Agregando...
                      </>
                    ) : (
                      'Agregar tarea'
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Response Message */}
        {responseMessage && (
          <div 
            className={`response-notification response-notification--${responseMessage.type}`}
            role="status"
            aria-live="polite"
          >
            <div className="notification-content">
              {responseMessage.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MilariModal;