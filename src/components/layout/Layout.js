import { useState } from 'react';
import Header from './Header';
import FloatingActions from './FloatingActions';
import HeroSection from '../sections/HeroSection';
import AddTaskModal from '../modals/AddTaskModal';
import VoiceAssistantPanel from '../modals/VoiceAssistantPanel';

const Layout = ({ 
  currentView, 
  onViewChange, 
  selectedDate, 
  stats, 
  onAddTask, 
  onReloadData,
  children 
}) => {
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const handleAddTask = async (taskData) => {
    await onAddTask(taskData);
    setShowAddTask(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <Header
        currentView={currentView}
        onViewChange={onViewChange}
        selectedDate={selectedDate}
        stats={stats}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Hero Section solo para vista 'today' */}
        {currentView === 'today' && (
          <HeroSection 
            selectedDate={selectedDate} 
            stats={stats} 
          />
        )}
        
        {/* Contenido dinámico de las vistas */}
        {children}
      </main>

      {/* Floating Actions */}
      <FloatingActions
        currentView={currentView}
        onViewChange={onViewChange}
        onShowVoiceAssistant={() => setShowVoiceAssistant(true)}
        onShowAddTask={() => setShowAddTask(true)}
        showAddTask={showAddTask}
      />

      {/* Modales */}
      {showVoiceAssistant && (
        <VoiceAssistantPanel
          onClose={() => setShowVoiceAssistant(false)}
          onTaskAdded={onReloadData}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
};

export default Layout;