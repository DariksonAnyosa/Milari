// MobileOptimizer.js - Optimizaciones específicas para móvil
import { useEffect } from 'react';
import usePWA from '../hooks/usePWA';

const MobileOptimizer = ({ children }) => {
  const { 
    isInstalled, 
    requestNotificationPermission, 
    subscribeToPushNotifications 
  } = usePWA();

  useEffect(() => {
    // Solo ejecutar en dispositivos móviles instalados
    if (isInstalled && window.screen.width <= 768) {
      initializeMobileFeatures();
    }
  }, [isInstalled]);

  const initializeMobileFeatures = async () => {
    try {
      // 1. Solicitar permisos de notificación
      const notificationGranted = await requestNotificationPermission();
      if (notificationGranted) {
        console.log('✅ Notificaciones habilitadas para MILARI IA');
        
        // 2. Suscribirse a push notifications
        await subscribeToPushNotifications();
      }

      // 3. Configurar gestos móviles
      setupMobileGestures();

      // 4. Optimizar para pantalla táctil
      optimizeTouchInterface();

      // 5. Mostrar tutorial inicial si es primera vez
      showInitialTutorial();

    } catch (error) {
      console.error('Error inicializando funciones móviles:', error);
    }
  };

  const setupMobileGestures = () => {
    // Doble tap para abrir MILARI IA
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        // Doble tap detectado
        if (e.target.closest('.milari-trigger')) {
          // Abrir MILARI IA
          const milariEvent = new CustomEvent('openMilari');
          document.dispatchEvent(milariEvent);
        }
      }
      lastTap = currentTime;
    });

    // Swipe gestures para navegación
    let startX, startY;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Swipe horizontal (cambiar vistas)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right - vista anterior
          const prevViewEvent = new CustomEvent('navigatePrev');
          document.dispatchEvent(prevViewEvent);
        } else {
          // Swipe left - vista siguiente
          const nextViewEvent = new CustomEvent('navigateNext');
          document.dispatchEvent(nextViewEvent);
        }
      }
      
      startX = null;
      startY = null;
    });
  };

  const optimizeTouchInterface = () => {
    // Aumentar área táctil de botones pequeños
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        /* Hacer botones más grandes para tocar */
        .btn, button {
          min-height: 44px !important;
          min-width: 44px !important;
          padding: 12px 16px !important;
        }
        
        /* Mejorar área de tap de la navegación */
        .nav-item {
          padding: 16px !important;
        }
        
        /* Hacer MILARI IA más accesible */
        .milari-voice-btn {
          min-height: 80px !important;
          min-width: 80px !important;
        }
        
        /* Prevenir zoom accidental */
        input, textarea, select {
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const showInitialTutorial = () => {
    const hasSeenTutorial = localStorage.getItem('milari_mobile_tutorial');
    
    if (!hasSeenTutorial) {
      // Mostrar tutorial después de 2 segundos
      setTimeout(() => {
        showMobileTutorial();
        localStorage.setItem('milari_mobile_tutorial', 'true');
      }, 2000);
    }
  };

  const showMobileTutorial = () => {
    // Crear tutorial overlay
    const tutorial = document.createElement('div');
    tutorial.className = 'mobile-tutorial-overlay';
    tutorial.innerHTML = `
      <div class="mobile-tutorial">
        <div class="tutorial-header">
          <h2>🎉 ¡MILARI IA Móvil!</h2>
          <p>Tu asistente ya está listo</p>
        </div>
        
        <div class="tutorial-tips">
          <div class="tip">
            <div class="tip-icon">🎤</div>
            <div class="tip-text">
              <strong>Habla con MILARI IA</strong>
              <p>Toca el botón del cerebro y di "Comprar leche"</p>
            </div>
          </div>
          
          <div class="tip">
            <div class="tip-icon">👆</div>
            <div class="tip-text">
              <strong>Gestos rápidos</strong>
              <p>Desliza izquierda/derecha para cambiar vistas</p>
            </div>
          </div>
          
          <div class="tip">
            <div class="tip-icon">🔔</div>
            <div class="tip-text">
              <strong>Notificaciones activas</strong>
              <p>Recibirás recordatorios de tus tareas</p>
            </div>
          </div>
        </div>
        
        <button class="tutorial-close">¡Entendido!</button>
      </div>
    `;

    // Estilos del tutorial
    const tutorialStyle = document.createElement('style');
    tutorialStyle.textContent = `
      .mobile-tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .mobile-tutorial {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 350px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .tutorial-header h2 {
        margin: 0 0 10px 0;
        color: #007AFF;
        font-size: 24px;
      }
      
      .tutorial-header p {
        margin: 0 0 30px 0;
        color: #666;
      }
      
      .tutorial-tips {
        text-align: left;
        margin-bottom: 30px;
      }
      
      .tip {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;
        gap: 15px;
      }
      
      .tip-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .tip-text strong {
        display: block;
        color: #333;
        margin-bottom: 5px;
      }
      
      .tip-text p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
      
      .tutorial-close {
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 12px;
        padding: 15px 30px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
      }
    `;

    document.head.appendChild(tutorialStyle);
    document.body.appendChild(tutorial);

    // Cerrar tutorial
    tutorial.querySelector('.tutorial-close').addEventListener('click', () => {
      tutorial.remove();
      tutorialStyle.remove();
    });
  };

  return children;
};

export default MobileOptimizer;