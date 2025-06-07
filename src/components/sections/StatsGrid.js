// components/sections/StatsGrid.js
import StatsCard from '../ui/StatsCard';

const StatsGrid = ({ stats }) => {
  const statsData = [
    {
      icon: '📋',
      number: stats.tasksToday,
      label: 'Tareas hoy',
      variant: 'default'
    },
    {
      icon: '✅',
      number: stats.completed,
      label: 'Completadas',
      variant: 'success'
    },
    {
      icon: '⏰',
      number: stats.pending,
      label: 'Pendientes',
      variant: 'warning'
    },
    {
      icon: '🔔',
      number: stats.reminders,
      label: 'Recordatorios',
      variant: 'info'
    }
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <StatsCard 
          key={index}
          icon={stat.icon}
          number={stat.number}
          label={stat.label}
          variant={stat.variant}
        />
      ))}
    </div>
  );
};

export default StatsGrid;