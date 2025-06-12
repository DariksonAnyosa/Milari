import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Target, Home } from 'lucide-react';
import ThemeToggle from '../layout/ThemeToggle';
import MobileThemeToggle from '../layout/MobileThemeToggle';

const UnifiedNavigation = ({ currentView, onViewChange, darkMode, toggleTheme }) => {
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth <= 767,
    isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
    isDesktop: window.innerWidth >= 1024
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const newScreenSize = {
        isMobile: width <= 767,
        isTablet: width >= 768 && width <= 1023,
        isDesktop: width >= 1024
      };
      console.log('📱 Screen size update:', { width, newScreenSize });
      setScreenSize(newScreenSize);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize, { passive: true });
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigationItems = [
    {
      id: 'today',
      label: 'Hoy',
      icon: Home,
      desktop: true,
      mobile: true
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      desktop: true,
      mobile: true
    },
    {
      id: 'tasks',
      label: 'Tareas',
      icon: CheckCircle,
      desktop: true,
      mobile: true
    },
    {
      id: 'focus',
      label: 'Enfoque',
      icon: Target,
      desktop: true,
      mobile: true
    }
  ];

  const handleNavClick = (viewId) => {
    console.log(`🧭 Navegando a: ${viewId}`);
    onViewChange(viewId);
    
    // Haptic feedback en mobile
    if (screenSize.isMobile && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // Desktop Header MEJORADO
  const DesktopHeader = () => (
    <header className="unified-header desktop">
      <div className="unified-header-container">
        {/* Logo solo M */}
        <div className="logo-section">
          <div className="logo-icon">M</div>
        </div>
        
        {/* Navegación central */}
        <nav className="nav-section" role="navigation" aria-label="Navegación principal">
          <div className="nav">
            {navigationItems
              .filter(item => item.desktop)
              .map(item => (
                <button
                  key={item.id}
                  className={`nav-btn ${
                    currentView === item.id ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick(item.id)}
                  aria-label={`Ir a ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <span className="nav-label">{item.label}</span>
                </button>
              ))
            }
          </div>
        </nav>
        
        {/* Theme toggle */}
        <div className="theme-section">
          <ThemeToggle 
            darkMode={darkMode} 
            toggleTheme={toggleTheme} 
          />
        </div>
      </div>
    </header>
  );

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <nav 
      className="bottom-navigation" 
      role="navigation" 
      aria-label="Navegación principal"
    >
      <div className="bottom-nav-content">
        {navigationItems
          .filter(item => item.mobile)
          .map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`bottom-nav-item ${
                  currentView === item.id ? 'bottom-nav-item--active' : ''
                }`}
                onClick={() => handleNavClick(item.id)}
                aria-label={`Ir a ${item.label}`}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                <IconComponent 
                  size={20} 
                  strokeWidth={1.5}
                  className="nav-icon" 
                />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })
        }
      </div>
    </nav>
  );

  return (
    <>
      {screenSize.isMobile ? (
        <>
          <MobileBottomNav />
          <MobileThemeToggle 
            darkMode={darkMode} 
            toggleTheme={toggleTheme} 
          />
        </>
      ) : (
        <DesktopHeader />
      )}
    </>
  );
};

export default UnifiedNavigation;