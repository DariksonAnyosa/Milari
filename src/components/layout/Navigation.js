// components/layout/Navigation.js
import { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';

const Navigation = ({ currentView, onViewChange, isMobile }) => {
  // Estado para controlar el tema (oscuro/claro)
  const [darkMode, setDarkMode] = useState(false);
  // Estado para el menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detectar la preferencia de tema del sistema al inicio
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    
    // Aplicar el tema al document.body
    if (prefersDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
      if (e.matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
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
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Función para abrir/cerrar el menú móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Cerrar menú móvil al seleccionar una opción
  const handleViewChange = (view) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { key: 'today', label: 'Hoy', icon: '📅' },
    { key: 'calendar', label: 'Calendario', icon: '🗓️' },
    { key: 'tasks', label: 'Tareas', icon: '✓' },
    { key: 'focus', label: 'Enfoque', icon: '◎' },
    { key: 'pomodoro', label: 'Pomodoro', icon: '⏱️' }
  ];

  // Renderizado condicional basado en si es móvil o desktop
  if (isMobile) {
    return (
      <div className="nav-wrapper mobile">
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
        />
        
        {/* Botón activo visible (solo texto) */}
        <div className="current-view-indicator">
          {navItems.find(item => item.key === currentView)?.label || 'Inicio'}
        </div>
      </div>
    );
  }

  // Versión desktop
  return (
    <div className="nav-wrapper desktop">
      <nav className="nav desktop">
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
        
        {/* Toggle de Tema */}
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className="theme-icon">
            {darkMode ? '☀️' : '🌙'}
          </span>
          <span className="theme-label">
            {darkMode ? 'Claro' : 'Oscuro'}
          </span>
        </button>
      </nav>
    </div>
  );
};

export default Navigation;