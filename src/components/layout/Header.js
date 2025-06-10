import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import ThemeToggle from './ThemeToggle';

const Header = ({ currentView, onViewChange, selectedDate, stats, darkMode, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Efecto scroll para header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="header-container">
        {/* Versión móvil */}
        {isMobile ? (
          <>
            {/* Navegación (hamburguesa) a la izquierda */}
            <div className="nav-section mobile">
              <Navigation 
                currentView={currentView} 
                onViewChange={onViewChange}
                isMobile={isMobile}
                selectedDate={selectedDate}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            </div>
            
            {/* Nombre de la vista actual */}
            <div className="current-view-section">
              <span className="current-view-text">{
                currentView === 'today' ? 'Hoy' :
                currentView === 'calendar' ? 'Calendario' :
                currentView === 'tasks' ? 'Tareas' :
                currentView === 'focus' ? 'Enfoque' :
                currentView === 'pomodoro' ? 'Pomodoro' : 'Inicio'
              }</span>
            </div>
            
            {/* Logo a la derecha */}
            <div className="logo-section mobile">
              <div className="logo-icon">M</div>
            </div>
          </>
        ) : (
          // Versión desktop
          <>
            {/* Logo a la izquierda */}
            <div className="logo-section">
              <div className="logo-icon">M</div>
            </div>

            {/* Navegación en el centro */}
            <div className="nav-section">
              <Navigation 
                currentView={currentView} 
                onViewChange={onViewChange}
                isMobile={isMobile}
                selectedDate={selectedDate}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            </div>

            {/* Toggle de tema a la derecha */}
            <div className="theme-section">
              <ThemeToggle 
                darkMode={darkMode} 
                toggleTheme={toggleTheme} 
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;