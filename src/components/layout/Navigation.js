// components/layout/Navigation.js
const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { key: 'today', label: 'Hoy' },
    { key: 'calendar', label: 'Calendario' },
    { key: 'tasks', label: 'Tareas' },
    { key: 'focus', label: 'Enfoque' },
    { key: 'pomodoro', label: 'Pomodoro' }
  ];

  return (
    <nav className="milari-nav">
      {navItems.map(item => (
        <button 
          key={item.key}
          className={`nav-btn ${currentView === item.key ? 'active' : ''}`}
          onClick={() => onViewChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;