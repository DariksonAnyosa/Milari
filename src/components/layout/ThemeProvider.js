import React from 'react';

const ThemeProvider = ({ darkMode, children }) => {
  return (
    <div className={`theme-provider ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {children}
    </div>
  );
};

export default ThemeProvider;
