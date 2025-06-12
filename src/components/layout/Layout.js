import { useState, useCallback } from 'react';
import UnifiedNavigation from '../navigation/UnifiedNavigation';
import CompactHeroSection from '../sections/CompactHeroSection';
import KPIDashboard from '../dashboard/KPIDashboard';
import FloatingActionButton from '../ui/FloatingActionButton';
import MilariModal from '../modals/MilariModal';
import VoiceModal from '../voice/VoiceModal';
import InstallPrompt from '../pwa/InstallPrompt';
import ThemeProvider from './ThemeProvider';

const Layout = ({ 
  currentView, 
  onViewChange, 
  selectedDate, 
  stats, 
  tasks,
  onAddTask, 
  onReloadData,
  darkMode,
  toggleTheme,
  children 
}) => {
  const [showMilari, setShowMilari] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const handleShowMilari = useCallback(() => {
    console.log('📋 Abriendo MilariModal');
    setShowMilari(true);
  }, []);

  const handleCloseMilari = useCallback(() => {
    console.log('❌ Cerrando MilariModal');
    setShowMilari(false);
  }, []);

  const handleShowVoice = useCallback(() => {
    setShowVoice(true);
  }, []);

  const handleCloseVoice = useCallback(() => {
    setShowVoice(false);
  }, []);

  const handleTaskAdded = useCallback(async () => {
    console.log('✅ Tarea agregada, recargando datos...');
    await onReloadData();
    console.log('✅ Datos recargados');
  }, [onReloadData]);

  return (
    <ThemeProvider darkMode={darkMode}>
      <div className={`dashboard-layout ${darkMode ? 'dark' : ''}`}>
        
        {/* Navegación unificada */}
        <UnifiedNavigation 
          currentView={currentView}
          onViewChange={onViewChange}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
        
        {/* Contenido principal */}
        <main className="dashboard-main">
          
          {/* Hero compacto - siempre visible */}
          <CompactHeroSection 
            selectedDate={selectedDate}
            stats={stats}
          />
          
          {/* KPI Dashboard - solo en vista 'today' */}
          {currentView === 'today' && (
            <KPIDashboard 
              tasks={tasks}
              stats={stats}
              selectedDate={selectedDate}
            />
          )}
          
          {/* Contenido dinámico según vista */}
          <div className="dynamic-content">
            {children}
          </div>
          
        </main>
        
        {/* FAB único */}
        <FloatingActionButton 
          onShowMilari={handleShowMilari}
          onShowVoice={handleShowVoice}
          darkMode={darkMode}
        />

        {/* Modal MILARI IA para agregar tareas */}
        {showMilari && (
          <MilariModal
            onClose={handleCloseMilari}
            onTaskAdded={handleTaskAdded}
            selectedDate={selectedDate}
            tasks={tasks}
            stats={stats}
            currentView={currentView}
            darkMode={darkMode}
          />
        )}

        {/* Modal de Voz para hablar con MILARI */}
        {showVoice && (
          <VoiceModal
            onClose={handleCloseVoice}
            onTaskAdded={handleTaskAdded}
            selectedDate={selectedDate}
            tasks={tasks}
            stats={stats}
            darkMode={darkMode}
          />
        )}

        {/* PWA Install Prompt */}
        <InstallPrompt />
      </div>
    </ThemeProvider>
  );
};

export default Layout;