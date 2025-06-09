import { useState } from 'react';
import Header from './Header';
import FloatingActions from './FloatingActions';
import HeroSection from '../sections/HeroSection';
import MilariModal from '../modals/MilariModal';
import InstallPrompt from '../pwa/InstallPrompt';

const Layout = ({ 
  currentView, 
  onViewChange, 
  selectedDate, 
  stats, 
  tasks,
  onAddTask, 
  onReloadData,
  children 
}) => {
  const [showMilari, setShowMilari] = useState(false);

  const handleShowMilari = () => {
    setShowMilari(true);
  };

  const handleCloseMilari = () => {
    setShowMilari(false);
  };

  const handleTaskAdded = async () => {
    await onReloadData();
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
            tasks={tasks}
            onAddTask={onAddTask}
            onShowAddTask={handleShowMilari}
          />
        )}
        
        {/* Contenido dinámico de las vistas */}
        {children}
      </main>

      {/* MILARI IA - Floating Actions rediseñado */}
      <FloatingActions
        currentView={currentView}
        onViewChange={onViewChange}
        onShowJarvis={handleShowMilari}
        tasks={tasks}
        stats={stats}
      />

      {/* Modal MILARI IA Unificado */}
      {showMilari && (
        <MilariModal
          onClose={handleCloseMilari}
          onTaskAdded={handleTaskAdded}
          selectedDate={selectedDate}
          tasks={tasks}
          stats={stats}
          currentView={currentView}
        />
      )}

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default Layout;