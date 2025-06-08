import { useState } from 'react';

const FocusView = ({ tasks, stats, onToggleTask, onDeleteTask }) => {
  return (
    <div className="focus-view">
      <div className="focus-container">
        {/* Header de la vista enfoque */}
        <div className="focus-header">
          <h2 className="focus-title">🎯 Modo Enfoque</h2>
          <p className="focus-subtitle">
            Interfaz adaptativa diseñada para maximizar tu productividad
          </p>
        </div>

        {/* Análisis de productividad */}
        <div className="productivity-analysis">
          <h3 className="analysis-title">📊 Análisis de Productividad</h3>
          
          <div className="analysis-grid">
            <div className="analysis-card">
              <h4>⏰ Mejor momento del día</h4>
              <p>Basado en tu historial, eres más productivo entre las 9-11 AM</p>
              <div className="time-chart">
                <div className="time-bars">
                  <div className="time-bar" style={{height: '40%'}}>6AM</div>
                  <div className="time-bar" style={{height: '60%'}}>8AM</div>
                  <div className="time-bar high" style={{height: '90%'}}>10AM</div>
                  <div className="time-bar high" style={{height: '85%'}}>12PM</div>
                  <div className="time-bar" style={{height: '70%'}}>2PM</div>
                  <div className="time-bar" style={{height: '50%'}}>4PM</div>
                  <div className="time-bar" style={{height: '30%'}}>6PM</div>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h4>📈 Tendencias semanales</h4>
              <p>Tus lunes y martes son los días más productivos</p>
              <div className="week-chart">
                <div className="week-bars">
                  <div className="week-bar high" style={{height: '85%'}}>L</div>
                  <div className="week-bar high" style={{height: '90%'}}>M</div>
                  <div className="week-bar" style={{height: '70%'}}>X</div>
                  <div className="week-bar" style={{height: '65%'}}>J</div>
                  <div className="week-bar" style={{height: '45%'}}>V</div>
                  <div className="week-bar" style={{height: '30%'}}>S</div>
                  <div className="week-bar" style={{height: '25%'}}>D</div>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h4>🎯 Tipos de tareas</h4>
              <p>Completas más tareas creativas por la mañana</p>
              <div className="task-types">
                <div className="task-type-item">
                  <span className="task-type-icon">🎨</span>
                  <span className="task-type-name">Creativas</span>
                  <span className="task-type-time">Mañana</span>
                </div>
                <div className="task-type-item">
                  <span className="task-type-icon">📋</span>
                  <span className="task-type-name">Administrativas</span>
                  <span className="task-type-time">Tarde</span>
                </div>
                <div className="task-type-item">
                  <span className="task-type-icon">📝</span>
                  <span className="task-type-name">Planificación</span>
                  <span className="task-type-time">Noche</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tareas actual */}
        <div className="focus-tasks">
          <h3>📋 Tareas del día</h3>
          <div className="tasks-list">
            {tasks && tasks.length > 0 ? (
              tasks.slice(0, 6).map((task, index) => (
                <div key={task.id || index} className="focus-task-item">
                  <button
                    className="task-checkbox"
                    onClick={() => onToggleTask(task.id)}
                  >
                    {task.status === 'completed' ? '✅' : '⚪'}
                  </button>
                  <span className="task-text">{task.text || task.title}</span>
                  <button
                    className="task-delete"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <div className="no-tasks">
                <p>No hay tareas para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Recomendaciones personalizadas */}
        <div className="personalized-recommendations">
          <h3 className="recommendations-title">💡 Recomendaciones Personalizadas</h3>
          
          <div className="recommendations-list">
            <div className="recommendation-card">
              <div className="recommendation-icon">🌅</div>
              <div className="recommendation-content">
                <h4>Bloquea tiempo de enfoque</h4>
                <p>Reserva las mañanas (9-11 AM) para tu trabajo más importante. Tu mente está más clara en este momento.</p>
              </div>
            </div>

            <div className="recommendation-card">
              <div className="recommendation-icon">📅</div>
              <div className="recommendation-content">
                <h4>Agrupa tareas similares</h4>
                <p>Procesa todos los correos y tareas administrativas en la tarde para mantener el flujo de trabajo.</p>
              </div>
            </div>

            <div className="recommendation-card">
              <div className="recommendation-icon">🌙</div>
              <div className="recommendation-content">
                <h4>Planifica antes de dormir</h4>
                <p>Dedica 15 minutos cada noche a planificar el día siguiente. Te ayudará a empezar con más claridad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusView;