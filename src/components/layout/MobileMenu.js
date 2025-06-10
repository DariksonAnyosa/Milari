// components/layout/MobileMenu.js
import React from 'react';
import { createPortal } from 'react-dom';
import ThemeToggle from './ThemeToggle';

const MobileMenu = ({ 
  isOpen, 
  navItems, 
  currentView, 
  onViewChange, 
  darkMode, 
  toggleTheme,
  onClose,
  selectedDate 
}) => {
  const formattedDate = selectedDate?.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });

  // Usar portal para renderizar fuera de la estructura principal
  const menuContent = (
    <>
      {/* Overlay para cerrar menú al hacer clic fuera */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={onClose} />
      )}
      
      {/* Menú desplegable */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h2 className="mobile-menu-title">Menú</h2>
          <button className="mobile-menu-close" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
        
        {/* Fecha */}
        <div className="mobile-menu-date">
          {formattedDate}
        </div>
        
        {/* Navegación principal */}
        <div className="mobile-menu-section">
          <h3 className="mobile-menu-section-title">Navegación</h3>
          <nav className="mobile-menu-nav">
            {navItems.map(item => (
              <button 
                key={item.key}
                className={`mobile-menu-item ${currentView === item.key ? 'active' : ''}`}
                onClick={() => onViewChange(item.key)}
              >
                <span className="mobile-menu-icon">{item.icon}</span>
                <span className="mobile-menu-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Sección para preferencias */}
        <div className="mobile-menu-section">
          <h3 className="mobile-menu-section-title">Preferencias</h3>
          <div className="mobile-theme-toggle-container">
            <span className="mobile-theme-label">
              Modo oscuro
            </span>
            <ThemeToggle 
              darkMode={darkMode} 
              toggleTheme={toggleTheme} 
            />
          </div>
        </div>
      </div>
    </>
  );

  // Renderizar en un portal directo al body
  return createPortal(menuContent, document.body);
};

export default MobileMenu;