// components/layout/Navigation.js
import { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';

const Navigation = ({ currentView, onViewChange, screenSize, selectedDate, darkMode, toggleTheme }) => {
  // Estado para el menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Función para abrir/cerrar el menú móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Cerrar menú móvil al seleccionar una opción
  const handleViewChange = (view) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  // Asegurar que el body no se desplace cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { key: 'today', label: 'Hoy', icon: '📅' },
    { key: 'calendar', label: 'Calendario', icon: '🗓️' },
    { key: 'tasks', label: 'Tareas', icon: '✓' },
    { key: 'focus', label: 'Enfoque', icon: '◎' },
    { key: 'pomodoro', label: 'Pomodoro', icon: '⏱️' }
  ];

  // Renderizado condicional basado en el tamaño de pantalla
  if (screenSize.isMobile) {
    return (
      <>
        {/* Botón hamburguesa para móvil */}
        <button 
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Menú de navegación"
        >
          <div className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        {/* Menú móvil desplegable */}
        <MobileMenu 
          isOpen={mobileMenuOpen}
          navItems={navItems}
          currentView={currentView}
          onViewChange={handleViewChange}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onClose={() => setMobileMenuOpen(false)}
          selectedDate={selectedDate}
        />
      </>
    );
  }

  // Versión desktop y tablet
  return (
    <nav className={`nav ${screenSize.isDesktop ? 'desktop' : 'tablet'}`}>
      {navItems.map(item => (
        <button 
          key={item.key}
          className={`nav-btn ${currentView === item.key ? 'active' : ''}`}
          onClick={() => onViewChange(item.key)}
          aria-label={item.label}
        >
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;