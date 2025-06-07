import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import ProductivityMeter from '../ui/ProductivityMeter';

const Header = ({ currentView, onViewChange, selectedDate, stats }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Efecto scroll para header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProductivityLevel = () => {
    const completionRate = stats.tasksToday ? (stats.completed / stats.tasksToday) * 100 : 0;
    if (completionRate >= 80) return 'high';
    if (completionRate >= 50) return 'medium';
    return 'low';
  };

  return (
    <header className={`milari-header-personal ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container-personal">
        {/* Logo a la izquierda */}
        <div className="logo-section">
          <div className="logo-icon">M</div>
        </div>

        {/* Saludo personalizado centrado */}
        <div className="personal-greeting">
          <h1 className="greeting-personal">Hola, Darikson</h1>
          <div className="date-simple">
            {selectedDate.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
        </div>

        {/* Indicadores de estado a la derecha */}
        <div className="status-indicators-right">
          <ProductivityMeter 
            percentage={Math.round((stats.completed / stats.tasksToday) * 100) || 0}
            level={getProductivityLevel()}
          />
          
          {currentView === 'pomodoro' && (
            <div className="focus-mode-active">
              <span className="focus-dot"></span>
              <span className="focus-label">Enfoque</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={onViewChange} 
      />
    </header>
  );
};

export default Header;