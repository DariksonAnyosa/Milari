import React from 'react';

const ThemeToggle = ({ darkMode, toggleTheme }) => {
  return (
    <div className="theme-toggle-container">
      <button 
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        <div className={`theme-toggle-slider ${darkMode ? 'dark' : 'light'}`}>
          <div className="theme-toggle-icon">
            {darkMode ? '☀️' : '🌙'}
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;