import { useState, useEffect } from 'react';
import './styles/index.css';

// Layout Components
import Layout from './components/layout/Layout';
import MobileOptimizer from './components/MobileOptimizer';

// View Components
import Calendar from './components/views/Calendar';
import TaskList from './components/views/TaskList';
import PomodoroTimer from './components/views/PomodoroTimer';
import FocusView from './components/views/FocusView';

// Custom Hooks
import useTasks from './hooks/useTasks';
import useStats from './hooks/useStats';
import useBrowserDetection from './hooks/useBrowserDetection';
import useTheme from './hooks/useTheme';

function App() {
  const [currentView, setCurrentView] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Custom hooks para funcionalidad específica
  useBrowserDetection(); // Detectar navegador y aplicar fixes
  const { darkMode, toggleTheme, isInitialized } = useTheme(); // Manejar temas
  
  // Custom hooks para manejo de datos
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    loadData 
  } = useTasks(selectedDate);
  
  const { todayStats } = useStats(tasks);

  // Debug del estado actual (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialized) {
      console.log('🔍 Estado de MILARI:', {
        darkMode,
        currentView,
        tasksCount: tasks.length,
        todayStats
      });
    }
  }, [darkMode, currentView, tasks.length, todayStats, isInitialized]);

  // Renderizar vista actual
  const renderCurrentView = () => {
    switch(currentView) {
      case 'today':
        return null; // El contenido se maneja en Layout con HeroSection
      case 'calendar':
        return (
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'focus':
        return (
          <FocusView
            tasks={tasks}
            stats={todayStats}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
      default:
        return null;
    }
  };

  // Loading screen mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="logo-icon">M</div>
          <p>Cargando MILARI...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileOptimizer>
      <div 
        className={`app ${darkMode ? 'dark-mode' : ''}`}
        data-theme={darkMode ? 'dark' : 'light'}
        data-dark={darkMode.toString()}
      >
        <Layout
          currentView={currentView}
          onViewChange={setCurrentView}
          selectedDate={selectedDate}
          stats={todayStats}
          tasks={tasks}
          onAddTask={addTask}
          onReloadData={loadData}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        >
          {renderCurrentView()}
        </Layout>
      </div>
    </MobileOptimizer>
  );
}

export default App;
