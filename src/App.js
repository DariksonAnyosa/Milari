import { useState, useEffect } from 'react';
import './styles/index.css';

// Layout Components
import Layout from './components/layout/Layout';
import MobileOptimizer from './components/MobileOptimizer';

// View Components
import Calendar from './components/views/Calendar';
import TaskList from './components/views/TaskList';
import TodayView from './components/views/TodayView';
import PomodoroTimer from './components/views/PomodoroTimer';
import FocusView from './components/views/FocusView';

// Custom Hooks
import useTasks from './hooks/useTasks';
import useStats from './hooks/useStats';

function App() {
  const [currentView, setCurrentView] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  
  // Inicialización del modo oscuro basado en preferencias del sistema
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    
    if (prefersDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    }
    
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
      if (e.matches) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Función para cambiar manualmente el tema
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  // Custom hooks para manejar lógica
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    loadData 
  } = useTasks(selectedDate);
  
  const { todayStats } = useStats(tasks);

  // Renderizar vista actual
  const renderCurrentView = () => {
    switch(currentView) {
      case 'today':
        return (
          <TodayView
            selectedDate={selectedDate}
            tasks={tasks}
            stats={todayStats}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
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

  return (
    <MobileOptimizer>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
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