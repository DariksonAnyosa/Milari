import { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation';
import ThemeToggle from './ThemeToggle';

const Header = ({ currentView, onViewChange, selectedDate, stats, darkMode, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth <= 767,
    isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
    isDesktop: window.innerWidth >= 1024
  });
  const headerRef = useRef(null);

  // Efecto scroll para header con nuevos breakpoints
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
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

  // 🔧 Fix para compatibilidad de navegadores
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Detectar tipo de navegador
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isBrave = navigator.brave && navigator.brave.isBrave;
    const isZen = /Zen/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    console.log('🌐 Navegador detectado:', {
      isChrome,
      isBrave: !!isBrave,
      isZen,
      isFirefox,
      userAgent: navigator.userAgent
    });

    // Aplicar clases específicas del navegador
    if (isBrave) {
      header.classList.add('brave-browser');
      document.body.classList.add('brave-browser');
    }
    if (isZen) {
      header.classList.add('zen-browser');
      document.body.classList.add('zen-browser');
    }
    if (isFirefox) {
      header.classList.add('firefox-browser');
      document.body.classList.add('firefox-browser');
    }

    // Aplicar theme con datos
    header.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    header.setAttribute('data-dark', darkMode.toString());

    // Force styles para Brave
    if (isBrave && darkMode) {
      header.style.setProperty('background', 'linear-gradient(135deg, #000000 0%, #1c1c1e 100%)', 'important');
      header.style.setProperty('border-bottom-color', 'rgba(255, 255, 255, 0.1)', 'important');
    }

    return () => {
      if (header) {
        header.classList.remove('brave-browser', 'zen-browser', 'firefox-browser');
      }
    };
  }, [darkMode]);

  // 🔧 Aplicar cambios de tema inmediatamente
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Multiple approaches para asegurar que el cambio se aplique
    header.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    header.setAttribute('data-dark', darkMode.toString());
    
    // Forzar re-render del CSS
    header.style.display = 'none';
    // Trigger reflow
    void header.offsetHeight;
    header.style.display = '';

    // Para navegadores problemáticos, aplicar estilos directamente
    const isBrave = navigator.brave && navigator.brave.isBrave;
    const isZen = /Zen/.test(navigator.userAgent);
    
    if ((isBrave || isZen) && darkMode) {
      setTimeout(() => {
        header.style.setProperty('background', 'linear-gradient(135deg, #000000 0%, #1c1c1e 100%)', 'important');
        header.style.setProperty('border-bottom-color', 'rgba(255, 255, 255, 0.1)', 'important');
      }, 50);
    } else if ((isBrave || isZen) && !darkMode) {
      setTimeout(() => {
        header.style.removeProperty('background');
        header.style.removeProperty('border-bottom-color');
      }, 50);
    }

    console.log('🔄 Header theme actualizado:', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const getHeaderClasses = () => {
    const classes = ['header'];
    
    if (isScrolled) classes.push('scrolled');
    
    // Nuevos breakpoints
    if (screenSize.isMobile) classes.push('mobile');
    if (screenSize.isTablet) classes.push('tablet');
    if (screenSize.isDesktop) classes.push('desktop');
    
    // Agregar clases de navegador
    if (navigator.brave && navigator.brave.isBrave) {
      classes.push('brave-browser');
    }
    if (/Zen/.test(navigator.userAgent)) {
      classes.push('zen-browser');
    }
    if (/Firefox/.test(navigator.userAgent)) {
      classes.push('firefox-browser');
    }

    return classes.join(' ');
  };

  return (
    <header 
      ref={headerRef}
      className={getHeaderClasses()}
      data-theme={darkMode ? 'dark' : 'light'}
      data-dark={darkMode.toString()}
      data-debug={darkMode ? 'dark' : 'light'}
    >
      <div className="header-container">
        {/* Versión móvil */}
        {screenSize.isMobile ? (
          <>
            {/* Navegación (hamburguesa) a la izquierda */}
            <div className="nav-section mobile">
              <Navigation 
                currentView={currentView} 
                onViewChange={onViewChange}
                screenSize={screenSize}
                selectedDate={selectedDate}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            </div>
            
            {/* Nombre de la vista actual */}
            <div className="current-view-section">
              <span 
                className="current-view-text"
                data-theme={darkMode ? 'dark' : 'light'}
              >
                {
                  currentView === 'today' ? 'Hoy' :
                  currentView === 'calendar' ? 'Calendario' :
                  currentView === 'tasks' ? 'Tareas' :
                  currentView === 'focus' ? 'Enfoque' :
                  currentView === 'pomodoro' ? 'Pomodoro' : 'Inicio'
                }
              </span>
            </div>
            
            {/* Logo a la derecha */}
            <div className="logo-section mobile">
              <div className="logo-icon">M</div>
            </div>
          </>
        ) : (
          // Versión desktop y tablet
          <>
            {/* Logo a la izquierda - SOLO LOGOMARK */}
            <div className="logo-section">
              <div className="logo-icon">M</div>
            </div>

            {/* Navegación */}
            <div className={`nav-section ${screenSize.isDesktop ? 'centered' : 'left'}`}>
              <Navigation 
                currentView={currentView} 
                onViewChange={onViewChange}
                screenSize={screenSize}
                selectedDate={selectedDate}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            </div>

            {/* Toggle de tema a la derecha */}
            <div className="theme-section">
              <ThemeToggle 
                darkMode={darkMode} 
                toggleTheme={toggleTheme} 
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;