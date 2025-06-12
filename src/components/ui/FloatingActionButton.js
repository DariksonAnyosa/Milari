import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const FloatingActionButton = ({ onShowMilari, onShowVoice, darkMode }) => {
  // eslint-disable-next-line no-unused-vars
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMicroCopy, setShowMicroCopy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-mostrar micro-copy despues de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMicroCopy(true);
      setTimeout(() => setShowMicroCopy(false), 5000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleFabClick = (e) => {
    console.log('✨ FAB clicked');
    
    // Ripple effect
    createRipple(e);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Mostrar modal de MILARI
    onShowMilari();
  };

  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
    
    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowMicroCopy(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowMicroCopy(false);
    }
  };

  const getFabLabel = () => {
    if (isProcessing) return 'Procesando...';
    if (isListening) return 'Escuchando...';
    return 'Planifica con MILARI';
  };

  return (
    <div 
      className="fab-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Micro-copy tooltip */}
      <div className={`fab-micro-copy ${
        showMicroCopy ? 'fab-micro-copy--visible' : ''
      }`}>
        <div className="micro-copy-content">
          <div className="micro-copy-title">Planifica con MILARI</div>
          <div className="micro-copy-example">
            Di o escribe: "anade repaso de ingles 10 AM"
          </div>
        </div>
        <div className="micro-copy-arrow" />
      </div>

      {/* FAB Principal */}
      <button
        className={`fab-main ${
          isListening ? 'fab-main--listening' : ''
        } ${
          isProcessing ? 'fab-main--processing' : ''
        }`}
        onClick={handleFabClick}
        aria-label={getFabLabel()}
        aria-describedby="fab-help-text"
      >
        {/* Ondas de listening */}
        {isListening && (
          <>
            <div className="listening-wave listening-wave--1" />
            <div className="listening-wave listening-wave--2" />
            <div className="listening-wave listening-wave--3" />
          </>
        )}
        
        {/* Icono principal */}
        <Sparkles 
          size={isMobile ? 20 : 24}
          strokeWidth={1.5}
          className="fab-icon"
        />
        
        {/* Spinner para processing */}
        {isProcessing && (
          <div className="processing-spinner" />
        )}
      </button>

      {/* Texto de ayuda para screen readers */}
      <div id="fab-help-text" className="sr-only">
        Planifica tareas con el asistente MILARI. 
        Puedes hablar o escribir comandos como: 
        "Anade reunion con cliente manana a las 2 PM" o 
        "Recordatorio de llamar al doctor".
      </div>
    </div>
  );
};

export default FloatingActionButton;