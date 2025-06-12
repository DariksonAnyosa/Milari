import React from 'react';

const ThemeToggle = ({ darkMode, toggleTheme }) => {
  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        role="switch"
        aria-checked={darkMode}
      >
        <div className="theme-toggle-track">
          <div className="theme-toggle-gradient"></div>
        </div>
        <div className={`theme-toggle-thumb ${darkMode ? 'dark' : 'light'}`}>
          <div className="theme-toggle-icon sun">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 2v2M12 20v2M20.66 7l-1.73 1M5.07 16l-1.73 1M20.66 17l-1.73-1M5.07 8l-1.73-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="theme-toggle-icon moon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;