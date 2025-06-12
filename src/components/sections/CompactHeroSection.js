import { useState, useEffect } from 'react';

const CompactHeroSection = ({ selectedDate, stats }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth <= 767,
    isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
    isDesktop: window.innerWidth >= 1024
  });

  // Detectar scroll para modo compacto
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width <= 767,
        isTablet: width >= 768 && width <= 1023,
        isDesktop: width >= 1024
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Generar saludo contextual profesional
  useEffect(() => {
    const completed = stats.completed || 0;
    const total = stats.tasksToday || 0;
    
    let statusMessage = '';
    if (total === 0) {
      statusMessage = 'Planifica tu dia de trabajo';
    } else if (completed === total && total > 0) {
      statusMessage = 'Todas las tareas completadas';
    } else if (completed > 0) {
      const remaining = total - completed;
      statusMessage = `${remaining} ${remaining === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
    } else {
      statusMessage = `${total} ${total === 1 ? 'tarea programada' : 'tareas programadas'}`;
    }
    
    setGreeting(statusMessage);
  }, [currentTime, stats]);

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Manana';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const getProgressColor = () => {
    const completed = stats.completed || 0;
    const total = stats.tasksToday || 0;
    
    if (total === 0) return 'var(--text-tertiary)';
    
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'var(--accent-success)';
    if (percentage >= 50) return 'var(--brand-primary)';
    return 'var(--accent-warning)';
  };

  // Determinar si mostrar modo compacto
  const isCompactMode = isScrolled && !screenSize.isMobile;
  
  return (
    <section 
      className={`compact-hero ${
        isCompactMode ? 'compact' : 'full'
      } ${screenSize.isMobile ? 'mobile' : ''}`} 
      role="banner"
    >
      <div className="hero-container">
        
        {isCompactMode ? (
          // Modo compacto (solo para desktop/tablet)
          <div className="greeting-compact">
            <span className="greeting-name">Darikson</span>
            {selectedDate.toDateString() === new Date().toDateString() && (
              <time className="live-time font-tabular">
                {currentTime.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
            )}
          </div>
        ) : (
          // Modo completo
          <>
            {/* Saludo principal */}
            <div className="greeting-section">
              <h1 className="greeting-title">
                Hola, Darikson
              </h1>
              <p 
                className="greeting-subtitle"
                style={{ color: getProgressColor() }}
              >
                {greeting}
              </p>
              
              {/* Botón de guía rápida */}
              <button className="quick-guide-btn">
                <span>Guía rápida</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Fecha e información contextual */}
            <div className="context-section">
              <time 
                className="current-date"
                dateTime={selectedDate.toISOString()}
              >
                {formatDate(selectedDate)}
              </time>
              
              {selectedDate.toDateString() === new Date().toDateString() && !screenSize.isMobile && (
                <div className="live-time font-tabular">
                  {currentTime.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CompactHeroSection;