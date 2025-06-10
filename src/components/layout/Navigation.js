// components/layout/Navigation.js
import { useState, useEffect } from 'react';

const Navigation = ({ currentView, onViewChange, isMobile }) => {
  // Estado para controlar el tema (oscuro/claro)
  const [darkMode, setDarkMode] = useState(false);
  
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

  const navItems = [
    { key: 'today', label: 'Hoy', icon: '📅' },
    { key: 'calendar', label: 'Calendario', icon: '🗓️' },
    { key: 'tasks', label: 'Tareas', icon: '✅' },
    { key: 'focus', label: 'Enfoque', icon: '🎯' },
    { key: 'pomodoro', label: 'Pomodoro', icon: '🍅' }
  ];

  return (
    <div className="nav-wrapper">
      <nav className={`nav ${isMobile ? 'mobile' : 'desktop'}`}>
        {navItems.map(item => (
          <button 
            key={item.key}
            className={`nav-btn ${currentView === item.key ? 'active' : ''}`}
            onClick={() => onViewChange(item.key)}
            aria-label={item.label}
          >
            {isMobile && (
              <span className="nav-icon">{item.icon}</span>
            )}
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
          {!isMobile && (
            <span className="theme-label">
              {darkMode ? 'Claro' : 'Oscuro'}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default Navigation;