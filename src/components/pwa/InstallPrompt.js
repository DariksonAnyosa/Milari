import { useState } from 'react';
import usePWA from '../../hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, isOnline, installApp, updateApp, updateAvailable } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || dismissed || (!isInstallable && !updateAvailable)) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setDismissed(true);
    }
  };

  const handleUpdate = async () => {
    await updateApp();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        {updateAvailable ? (
          // Update prompt
          <>
            <div className="install-icon">🔄</div>
            <div className="install-text">
              <h4>Nueva versión disponible</h4>
              <p>MILARI IA tiene mejoras para ti</p>
            </div>
            <div className="install-actions">
              <button 
                className="install-btn primary"
                onClick={handleUpdate}
              >
                Actualizar
              </button>
              <button 
                className="install-btn secondary"
                onClick={handleDismiss}
              >
                Después
              </button>
            </div>
          </>
        ) : (
          // Install prompt
          <>
            <div className="install-icon">📱</div>
            <div className="install-text">
              <h4>Instalar MILARI IA</h4>
              <p>Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <div className="install-actions">
              <button 
                className="install-btn primary"
                onClick={handleInstall}
              >
                Instalar
              </button>
              <button 
                className="install-btn secondary"
                onClick={handleDismiss}
              >
                No, gracias
              </button>
            </div>
          </>
        )}
        
        {/* Status indicator */}
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          <div className="status-dot"></div>
          <span className="status-text">
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;