// components/ui/ElectronWindow.js - Controles ventana Electron
import { useState, useEffect } from 'react';

const ElectronWindow = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Verificar si estamos en Electron
  const isElectron = window.electron !== undefined;

  const minimizeWindow = () => {
    if (isElectron) {
      window.electron.minimize();
    }
  };

  const maximizeWindow = () => {
    if (isElectron) {
      window.electron.maximize();
      setIsMaximized(!isMaximized);
    }
  };

  const closeWindow = () => {
    if (isElectron) {
      window.electron.close();
    }
  };

  if (!isElectron) return null;

  return (
    <div className="electron-titlebar">
      <button onClick={minimizeWindow}>-</button>
      <button onClick={maximizeWindow}>
        {isMaximized ? '❐' : '□'}
      </button>
      <button onClick={closeWindow}>×</button>
    </div>
  );
};

export default ElectronWindow;