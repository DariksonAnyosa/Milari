import React from 'react';
import { Sun, Moon } from 'lucide-react';

const MobileThemeToggle = ({ darkMode, toggleTheme }) => {
  console.log('🎨 MobileThemeToggle renderizado:', { darkMode });
  
  return (
    <button
      className="mobile-theme-toggle"
      onClick={() => {
        console.log('🎨 Toggle clicked!');
        toggleTheme();
      }}
      aria-label="Cambiar tema"
      aria-pressed={darkMode}
      title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      style={{
        position: 'fixed',
        zIndex: 1000,
        left: '16px', /* CAMBIAR A LA IZQUIERDA */
        bottom: '100px', /* MÁS CERCA DEL BOTTOM NAV */
        width: '48px', /* LIGERAMENTE MÁS GRANDE */
        height: '48px',
        borderRadius: '50%',
        background: darkMode ? '#131B27' : 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      {darkMode ? (
        <Sun 
          size={20} 
          strokeWidth={2}
          className="theme-icon sun"
        />
      ) : (
        <Moon 
          size={20} 
          strokeWidth={2}
          className="theme-icon moon"
        />
      )}
    </button>
  );
};

export default MobileThemeToggle;