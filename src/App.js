import { useState, useEffect } from 'react';
import './index.css';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import TodayView from './components/TodayView';
import VoiceAssistant from './components/VoiceAssistant';
import { getDB } from './database/DatabaseManager';

function App() {
  const [currentView, setCurrentView] = useState('today'); // 'today', 'calendar', 'tasks'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [todayStats, setTodayStats] = useState({
    tasksToday: 0,
    completed: 0,
    pending: 0,
    reminders: 0
  });
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const db = getDB();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const allTasks = await db.getTasks();
      setTasks(allTasks);
      
      const stats = await db.getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const addTask = async (taskData) => {
    try {
      await db.addTask(taskData);
      await loadData(); // Recargar datos
    } catch (error) {
      console.error('Error agregando tarea:', error);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task.status === 'pending') {
        await db.completeTask(taskId, '😊');
      } else {
        // Reactivar tarea usando updateTaskStatus
        await db.updateTaskStatus(taskId, 'pending');
      }
      await loadData();
    } catch (error) {
      console.error('Error actualizando tarea:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await db.deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Milari</h1>
            <div className="current-date">
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="header-right">
            <div className="stats-quick">
              <span className="stat-item">
                <span className="stat-number">{todayStats.pending}</span>
                <span className="stat-label">Pendientes</span>
              </span>
              <span className="stat-item">
                <span className="stat-number">{todayStats.completed}</span>
                <span className="stat-label">Completadas</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${currentView === 'today' ? 'active' : ''}`}
            onClick={() => setCurrentView('today')}
          >
            <span className="nav-icon">📋</span>
            Hoy
          </button>
          <button 
            className={`nav-btn ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => setCurrentView('calendar')}
          >
            <span className="nav-icon">📅</span>
            Calendario
          </button>
          <button 
            className={`nav-btn ${currentView === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentView('tasks')}
          >
            <span className="nav-icon">✅</span>
            Todas las Tareas
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {currentView === 'today' && (
          <TodayView
            selectedDate={selectedDate}
            tasks={tasks}
            stats={todayStats}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        )}
        
        {currentView === 'calendar' && (
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
          />
        )}
        
        {currentView === 'tasks' && (
          <TaskList
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        )}
      </main>

      {/* Voice Assistant - Flotante en esquina */}
      <div className="voice-assistant-container">
        <button 
          className="voice-trigger-btn"
          onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
          title="Asistente de Voz"
        >
          🎤
        </button>
        
        {showVoiceAssistant && (
          <div className="voice-assistant-panel">
            <VoiceAssistant 
              onClose={() => setShowVoiceAssistant(false)}
              onTaskAdded={loadData}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;