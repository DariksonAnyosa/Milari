import { useState, useEffect } from 'react';
import Navigation from './Navigation';

const Header = ({ currentView, onViewChange, selectedDate, stats }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Efecto scroll para header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="header-container">
        {/* Logo a la izquierda (en móvil a la derecha) */}
        <div className="logo-section">
          <div className="logo-icon">M</div>
        </div>

        {/* Navegación centrada (en móvil con hamburguesa) */}
        <div className="nav-section">
          <Navigation 
            currentView={currentView} 
            onViewChange={onViewChange}
            isMobile={isMobile}
          />
        </div>

        {/* Fecha a la derecha (oculta en móvil) */}
        <div className="date-section">
          <div className="date-display">
            {selectedDate.toLocaleDateString('es-ES', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;