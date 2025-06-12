import { useEffect, useCallback } from 'react';
import usePWA from '../hooks/usePWA';

const MobileOptimizer = ({ children }) => {
  const { 
    isInstalled, 
    requestNotificationPermission, 
    subscribeToPushNotifications 
  } = usePWA();

  const initializeMobileFeatures = useCallback(async () => {
    try {
      // Solo hacer lo esencial: permisos de notificación
      if (requestNotificationPermission) {
        const notificationGranted = await requestNotificationPermission();
        if (notificationGranted && subscribeToPushNotifications) {
          await subscribeToPushNotifications();
        }
      }

      // Optimización táctil básica
      if (!document.getElementById('mobile-optimization')) {
        const style = document.createElement('style');
        style.id = 'mobile-optimization';
        style.textContent = `
          @media (max-width: 768px) {
            button, .btn { min-height: 44px; min-width: 44px; }
            input, textarea { font-size: 16px; }
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.warn('Error inicializando móvil:', error);
    }
  }, [requestNotificationPermission, subscribeToPushNotifications]);

  useEffect(() => {
    if (isInstalled && window.innerWidth <= 768) {
      initializeMobileFeatures();
    }
  }, [isInstalled, initializeMobileFeatures]);

  return children;
};

export default MobileOptimizer;