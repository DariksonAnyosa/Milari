import { useState } from 'react';
import './styles/index.css';

// Layout Components
import Layout from './components/layout/Layout';

// View Components
import Calendar from './components/views/Calendar';
import TaskList from './components/views/TaskList';
import TodayView from './components/views/TodayView';
import PomodoroTimer from './components/views/PomodoroTimer';

// Custom Hooks
import useTasks from './hooks/useTasks';
import useStats from './hooks/useStats';

function App() {
  const [currentView, setCurrentView] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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
      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      selectedDate={selectedDate}
      stats={todayStats}
      onAddTask={addTask}
      onReloadData={loadData}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;