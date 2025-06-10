// components/layout/MobileMenu.js
import React from 'react';

const MobileMenu = ({ 
  isOpen, 
  navItems, 
  currentView, 
  onViewChange, 
  darkMode, 
  toggleTheme,
  onClose 
}) => {
  return (
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
        
        <div className="mobile-menu-footer">
          <button 
            className="mobile-theme-toggle"
            onClick={toggleTheme}
          >
            <span className="mobile-theme-icon">
              {darkMode ? '☀️' : '🌙'}
            </span>
            <span className="mobile-theme-label">
              {darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;