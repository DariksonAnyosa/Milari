import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Target } from 'lucide-react';

const KPIDashboard = ({ tasks = [], stats = {}, selectedDate }) => {
  const [nextMeeting, setNextMeeting] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [pomodoroData, setPomodoroData] = useState({ current: 2, target: 5 });

  // Calcular proxima reunion
  useEffect(() => {
    const now = new Date();
    const today = selectedDate || now;
    
    // Filtrar tareas de hoy que tengan hora especifica
    const todayMeetings = tasks.filter(task => {
      const taskDate = new Date(task.scheduled_time);
      return (
        taskDate.toDateString() === today.toDateString() &&
        taskDate > now &&
        (task.type === 'meeting' || task.title?.toLowerCase().includes('reunion') || task.title?.toLowerCase().includes('meeting'))
      );
    });

    if (todayMeetings.length > 0) {
      // Ordenar por hora y tomar la mas proxima
      const sortedMeetings = todayMeetings.sort((a, b) => 
        new Date(a.scheduled_time) - new Date(b.scheduled_time)
      );
      setNextMeeting(sortedMeetings[0]);
    } else {
      // Mock data si no hay reuniones
      setNextMeeting({
        scheduled_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30).toISOString(),
        title: 'Team standup'
      });
    }
  }, [tasks, selectedDate]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTasksProgress = () => {
    const completed = stats.completed || 0;
    const total = stats.tasksToday || 0;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const progress = getTasksProgress();
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  // Crear path para donut chart de Pomodoro
  const createDonutPath = (centerX, centerY, radius, startAngle, endAngle) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getPomodoroSegments = () => {
    const segments = [];
    const segmentAngle = 360 / pomodoroData.target;
    const gap = 8; // Gap between segments
    
    for (let i = 0; i < pomodoroData.target; i++) {
      const startAngle = i * segmentAngle + (i * gap);
      const endAngle = startAngle + segmentAngle - gap;
      const isCompleted = i < pomodoroData.current;
      
      segments.push({
        id: i,
        path: createDonutPath(24, 24, 16, startAngle, endAngle),
        completed: isCompleted
      });
    }
    
    return segments;
  };

  const pomodoroSegments = getPomodoroSegments();

  return (
    <section className="kpi-dashboard" aria-label="Dashboard de metricas">
      <div className="kpi-grid">
        
        {/* Proxima Cita */}
        <div className="kpi-card" role="group" aria-label="Proxima cita">
          <div className="kpi-header">
            <CalendarDays 
              size={20} 
              strokeWidth={1.5}
              className="kpi-icon"
            />
            <h3 className="kpi-title">Proxima cita</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value font-tabular">
              {nextMeeting ? formatTime(nextMeeting.scheduled_time) : '--:--'}
            </div>
            <div className="kpi-label">
              {nextMeeting ? nextMeeting.title : 'Sin citas programadas'}
            </div>
          </div>
        </div>

        {/* Tareas Hoy */}
        <div className="kpi-card" role="group" aria-label="Progreso de tareas">
          <div className="kpi-header">
            <CheckCircle 
              size={20} 
              strokeWidth={1.5}
              className="kpi-icon"
            />
            <h3 className="kpi-title">Tareas hoy</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value-with-chart">
              <div className="kpi-value font-tabular">
                {progress.completed}/{progress.total}
              </div>
              <div className="progress-ring">
                <svg width="48" height="48" viewBox="0 0 48 48" className="progress-svg">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="var(--neutral-200)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="var(--brand-primary)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 24 24)"
                    className="progress-circle"
                  />
                </svg>
                <div className="progress-percentage font-tabular">
                  {Math.round(progress.percentage)}%
                </div>
              </div>
            </div>
            <div className="kpi-label">
              {progress.total > 0 ? 'Completadas' : 'Sin tareas'}
            </div>
          </div>
        </div>

        {/* Racha Pomodoro */}
        <div className="kpi-card" role="group" aria-label="Racha Pomodoro">
          <div className="kpi-header">
            <Target 
              size={20} 
              strokeWidth={1.5}
              className="kpi-icon"
            />
            <h3 className="kpi-title">Racha Pomodoro</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value-with-chart">
              <div className="kpi-value font-tabular">
                {pomodoroData.current}/{pomodoroData.target}
              </div>
              <div className="donut-chart">
                <svg width="48" height="48" viewBox="0 0 48 48" className="donut-svg">
                  {pomodoroSegments.map(segment => (
                    <path
                      key={segment.id}
                      d={segment.path}
                      stroke={segment.completed ? 'var(--brand-primary)' : 'var(--neutral-200)'}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      className={`donut-segment ${segment.completed ? 'completed' : 'pending'}`}
                    />
                  ))}
                </svg>
              </div>
            </div>
            <div className="kpi-label">
              {pomodoroData.current > 0 ? 'Sesiones hoy' : 'Comenzar sesion'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KPIDashboard;