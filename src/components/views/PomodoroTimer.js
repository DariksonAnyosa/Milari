import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PomodoroTimer = () => {
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    totalFocusTime: 0,
    tasksCompleted: 0,
    averageSessionLength: 0,
    bestFocusHour: null,
    consecutiveDays: 0
  });
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  
  const intervalRef = useRef(null);
  const sessionStartTime = useRef(null);

  // Configuración de tiempos personalizable
  const [customTimes, setCustomTimes] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  });

  const modeLabels = useMemo(() => ({
    focus: 'Enfoque',
    shortBreak: 'Descanso corto',
    longBreak: 'Descanso largo'
  }), []);

  const motivationalMessages = [
    "¡Mantén el enfoque! Cada minuto cuenta.",
    "Tu futuro yo te agradecerá este esfuerzo.",
    "La disciplina es el puente entre metas y logros.",
    "Pequeños progresos diarios = grandes resultados.",
    "¡Estás construyendo el hábito del éxito!"
  ];

  // Funciones auxiliares
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBestFocusHour = (sessions) => {
    if (sessions.length === 0) return null;
    
    const hourCounts = {};
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );
  };

  const calculateConsecutiveDays = () => {
    const uniqueDays = [...new Set(sessionHistory.map(s => 
      new Date(s.date).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < uniqueDays.length; i++) {
      const daysDiff = Math.floor((new Date(today) - new Date(uniqueDays[i])) / (1000 * 60 * 60 * 24));
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const updateDailyStats = (sessionData) => {
    const today = new Date().toDateString();
    const todaySessions = sessionHistory.filter(s => 
      new Date(s.date).toDateString() === today
    );
    
    const newStats = {
      totalFocusTime: todaySessions.reduce((acc, s) => 
        s.mode === 'focus' ? acc + s.duration : acc, 0
      ),
      tasksCompleted: completedTasks.filter(t => 
        new Date(t.completedAt).toDateString() === today
      ).length,
      averageSessionLength: todaySessions.length > 0 
        ? todaySessions.reduce((acc, s) => acc + s.duration, 0) / todaySessions.length 
        : 0,
      bestFocusHour: getBestFocusHour(todaySessions),
      consecutiveDays: calculateConsecutiveDays()
    };
    
    setDailyStats(newStats);
    localStorage.setItem('milari_daily_stats', JSON.stringify(newStats));
  };

  const saveSessionData = (sessionData) => {
    try {
      const updatedHistory = [...sessionHistory, sessionData];
      setSessionHistory(updatedHistory);
      localStorage.setItem('milari_pomodoro_sessions', JSON.stringify(updatedHistory));
      
      // Actualizar estadísticas diarias
      updateDailyStats(sessionData);
    } catch (error) {
      console.warn('Error guardando datos del Pomodoro:', error);
    }
  };

  const getMotivationalMessage = (sessionCount) => {
    if (sessionCount === 1) return "¡Gran comienzo! El primer paso es el más importante.";
    if (sessionCount === 4) return "¡Increíble! Has completado un ciclo completo de Pomodoro.";
    if (sessionCount === 8) return "¡Eres imparable! Tu enfoque es admirable.";
    if (sessionCount >= 12) return "¡Leyenda! Tu disciplina es inspiradora.";
    
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  };

  const playNotificationSound = () => {
    // Sonido más suave y agradable
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Secuencia de tonos más melódica
    const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 200);
    });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(customTimes[newMode]);
    setIsRunning(false);
  };

  // useCallback functions
  const loadStoredData = useCallback(() => {
    try {
      const savedSessions = localStorage.getItem('milari_pomodoro_sessions');
      const savedStats = localStorage.getItem('milari_daily_stats');
      const savedTasks = localStorage.getItem('milari_completed_tasks');
      
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessionHistory(parsedSessions);
        setSessions(parsedSessions.filter(s => isToday(new Date(s.date))).length);
      }
      
      if (savedStats) {
        setDailyStats(JSON.parse(savedStats));
      }
      
      if (savedTasks) {
        setCompletedTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.warn('Error cargando datos del Pomodoro:', error);
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    playNotificationSound();
    
    const sessionData = {
      mode,
      duration: customTimes[mode],
      date: new Date().toISOString(),
      task: currentTask,
      completed: true
    };
    
    if (mode === 'focus') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      // Actualizar racha actual
      setCurrentStreak(prev => prev + 1);
      
      // Actualizar récord personal
      if (newSessions > personalBest) {
        setPersonalBest(newSessions);
        localStorage.setItem('milari_personal_best', newSessions.toString());
      }
      
      // Completar tarea si hay una
      if (currentTask.trim()) {
        const completedTask = {
          name: currentTask,
          completedAt: new Date().toISOString(),
          pomodoroSession: newSessions
        };
        setCompletedTasks(prev => [...prev, completedTask]);
        localStorage.setItem('milari_completed_tasks', JSON.stringify([...completedTasks, completedTask]));
        setCurrentTask('');
      }
      
      // Cada 4 sesiones de enfoque, descanso largo
      if (newSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
      
      // Notificación personalizada con insights
      if ('Notification' in window && Notification.permission === 'granted') {
        const message = getMotivationalMessage(newSessions);
        new Notification('¡Sesión de enfoque completada! 🎯', {
          body: message,
          icon: '/favicon.ico'
        });
      }
    } else {
      switchMode('focus');
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Descanso terminado! 💪', {
          body: 'Es hora de volver al enfoque. ¡Tú puedes!',
          icon: '/favicon.ico'
        });
      }
    }
    
    // Guardar datos de la sesión
    saveSessionData(sessionData);
  }, [mode, customTimes, currentTask, sessions, personalBest, completedTasks]);

  // Cargar datos guardados al inicializar
  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  // Actualizar título de la página con el timer
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${modeLabels[mode]} | MILARI`;
    } else {
      document.title = 'MILARI - Tu asistente de productividad';
    }
    
    return () => {
      document.title = 'MILARI - Tu asistente de productividad';
    };
  }, [timeLeft, isRunning, mode, modeLabels]);

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      // Solicitar permisos de notificación si no los tiene
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      sessionStartTime.current = new Date();
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customTimes[mode]);
    if (mode === 'focus') {
      setCurrentStreak(0);
    }
  };

  const getProgressPercentage = () => {
    return ((customTimes[mode] - timeLeft) / customTimes[mode]) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return '#ef4444';
      case 'shortBreak': return '#10b981';
      case 'longBreak': return '#3b82f6';
      default: return '#ef4444';
    }
  };

  const updateCustomTime = (mode, minutes) => {
    const newTimes = { ...customTimes, [mode]: minutes * 60 };
    setCustomTimes(newTimes);
    localStorage.setItem('milari_custom_times', JSON.stringify(newTimes));
    
    if (!isRunning) {
      setTimeLeft(newTimes[mode]);
    }
  };

  const getInsightMessage = () => {
    if (dailyStats.consecutiveDays >= 7) {
      return `🔥 ¡${dailyStats.consecutiveDays} días consecutivos! Eres una máquina de productividad.`;
    }
    if (sessions >= 8) {
      return "🚀 ¡Día súper productivo! Has superado las 8 sesiones.";
    }
    if (dailyStats.bestFocusHour) {
      return `⭐ Tu mejor hora de enfoque es a las ${dailyStats.bestFocusHour}:00h`;
    }
    if (sessions >= 4) {
      return "💪 ¡Excelente progreso! Has completado más de 4 sesiones.";
    }
    return "🎯 ¡Comienza tu primera sesión y construye el hábito!";
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-card">
        {/* Header mejorado con insights */}
        <div className="pomodoro-header">
          <h2>Técnica Pomodoro</h2>
          <div className="session-counter">
            <span>Sesiones hoy: {sessions}</span>
            {personalBest > 0 && <span className="personal-best">Récord: {personalBest}</span>}
          </div>
          
          {/* Insight personal */}
          <div className="daily-insight">
            {getInsightMessage()}
          </div>
        </div>

        {/* Selector de modo mejorado */}
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => switchMode('focus')}
            disabled={isRunning}
          >
            Enfoque ({Math.floor(customTimes.focus / 60)}min)
          </button>
          <button 
            className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => switchMode('shortBreak')}
            disabled={isRunning}
          >
            Descanso ({Math.floor(customTimes.shortBreak / 60)}min)
          </button>
          <button 
            className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => switchMode('longBreak')}
            disabled={isRunning}
          >
            Descanso L. ({Math.floor(customTimes.longBreak / 60)}min)
          </button>
        </div>

        {/* Timer principal con animación mejorada */}
        <div className="timer-display">
          <div className="timer-circle" style={{ '--progress': getProgressPercentage(), '--color': getModeColor() }}>
            <div className="timer-time">
              {formatTime(timeLeft)}
            </div>
            <div className="timer-mode">
              {modeLabels[mode]}
            </div>
            {currentStreak > 0 && mode === 'focus' && (
              <div className="streak-indicator">
                🔥 {currentStreak}
              </div>
            )}
          </div>
        </div>

        {/* Tarea actual mejorada */}
        {mode === 'focus' && (
          <div className="current-task-section">
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="¿En qué vas a trabajar? (opcional)"
              className="task-input"
              disabled={isRunning}
            />
            {currentTask && !isRunning && (
              <div className="task-preview">
                📝 Trabajando en: <strong>{currentTask}</strong>
              </div>
            )}
          </div>
        )}

        {/* Controles */}
        <div className="timer-controls">
          <button 
            className={`control-btn primary ${isRunning ? 'pause' : 'play'}`}
            onClick={toggleTimer}
          >
            {isRunning ? '⏸️ Pausar' : '▶️ Comenzar'}
          </button>
          <button 
            className="control-btn secondary"
            onClick={resetTimer}
          >
            🔄 Reiniciar
          </button>
        </div>

        {/* Estadísticas mejoradas */}
        <div className="pomodoro-stats">
          <div className="stat-item">
            <span className="stat-label">Tiempo enfocado hoy</span>
            <span className="stat-value">{Math.floor(dailyStats.totalFocusTime / 60)} min</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tareas completadas</span>
            <span className="stat-value">{dailyStats.tasksCompleted}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Racha de días</span>
            <span className="stat-value">{dailyStats.consecutiveDays} 🔥</span>
          </div>
        </div>

        {/* Configuración rápida */}
        {!isRunning && (
          <div className="quick-settings">
            <h4>⚙️ Configuración rápida</h4>
            <div className="time-adjusters">
              <div className="time-adjuster">
                <label>Enfoque:</label>
                <select 
                  value={Math.floor(customTimes.focus / 60)}
                  onChange={(e) => updateCustomTime('focus', parseInt(e.target.value))}
                >
                  <option value={15}>15 min</option>
                  <option value={25}>25 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              <div className="time-adjuster">
                <label>Descanso:</label>
                <select 
                  value={Math.floor(customTimes.shortBreak / 60)}
                  onChange={(e) => updateCustomTime('shortBreak', parseInt(e.target.value))}
                >
                  <option value={3}>3 min</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tareas completadas hoy */}
        {completedTasks.filter(t => isToday(new Date(t.completedAt))).length > 0 && (
          <div className="completed-tasks">
            <h4>✅ Completadas hoy</h4>
            <div className="tasks-list">
              {completedTasks
                .filter(t => isToday(new Date(t.completedAt)))
                .slice(-3)
                .map((task, index) => (
                  <div key={index} className="completed-task">
                    {task.name}
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Consejos mejorados */}
        <div className="pomodoro-tips">
          <h4>💡 Consejos para maximizar tu enfoque:</h4>
          <ul>
            <li>Define una tarea específica antes de comenzar cada sesión</li>
            <li>Elimina todas las distracciones (teléfono, redes sociales)</li>
            <li>No rompas el timer - la magia está en completar la sesión</li>
            <li>Usa los descansos para moverte o hacer ejercicios de respiración</li>
            <li>Celebra cada sesión completada, por pequeña que sea</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;