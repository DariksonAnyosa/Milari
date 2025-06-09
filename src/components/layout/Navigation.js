// components/layout/Navigation.js
const Navigation = ({ currentView, onViewChange, isMobile }) => {
  const navItems = [
    { key: 'today', label: 'Hoy', icon: '📅' },
    { key: 'calendar', label: 'Calendario', icon: '🗓️' },
    { key: 'tasks', label: 'Tareas', icon: '✅' },
    { key: 'focus', label: 'Enfoque', icon: '🎯' },
    { key: 'pomodoro', label: 'Pomodoro', icon: '🍅' }
  ];

  return (
    <nav className={`milari-nav-clean ${isMobile ? 'mobile' : 'desktop'}`}>
      {navItems.map(item => (
        <button 
          key={item.key}
          className={`nav-btn-clean ${currentView === item.key ? 'active' : ''}`}
          onClick={() => onViewChange(item.key)}
        >
          {isMobile && (
            <span className="nav-icon">{item.icon}</span>
          )}
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;