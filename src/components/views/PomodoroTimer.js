import { useState, useEffect, useRef } from 'react';

const PomodoroTimer = () => {
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Configuración de tiempos
  const times = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const modeLabels = {
    focus: 'Enfoque',
    shortBreak: 'Descanso corto',
    longBreak: 'Descanso largo'
  };

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
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playNotificationSound();
    
    if (mode === 'focus') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      // Cada 4 sesiones de enfoque, descanso largo
      if (newSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
      
      // Notificación de finalización
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Sesión de enfoque completada!', {
          body: `Has completado ${newSessions} sesiones. Tiempo de descansar.`,
          icon: '/favicon.ico'
        });
      }
    } else {
      switchMode('focus');
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Descanso terminado!', {
          body: 'Es hora de volver al enfoque.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const playNotificationSound = () => {
    // Crear un sonido simple usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(times[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      // Solicitar permisos de notificación si no los tiene
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(times[mode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((times[mode] - timeLeft) / times[mode]) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return '#ef4444';
      case 'shortBreak': return '#10b981';
      case 'longBreak': return '#3b82f6';
      default: return '#ef4444';
    }
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-card">
        <div className="pomodoro-header">
          <h2>Técnica Pomodoro</h2>
          <div className="session-counter">
            <span>Sesiones completadas: {sessions}</span>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => switchMode('focus')}
            disabled={isRunning}
          >
            Enfoque
          </button>
          <button 
            className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => switchMode('shortBreak')}
            disabled={isRunning}
          >
            Descanso
          </button>
          <button 
            className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => switchMode('longBreak')}
            disabled={isRunning}
          >
            Descanso largo
          </button>
        </div>

        {/* Timer principal */}
        <div className="timer-display">
          <div className="timer-circle" style={{ '--progress': getProgressPercentage(), '--color': getModeColor() }}>
            <div className="timer-time">
              {formatTime(timeLeft)}
            </div>
            <div className="timer-mode">
              {modeLabels[mode]}
            </div>
          </div>
        </div>

        {/* Tarea actual */}
        {mode === 'focus' && (
          <div className="current-task-section">
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="¿En qué vas a trabajar?"
              className="task-input"
              disabled={isRunning}
            />
          </div>
        )}

        {/* Controles */}
        <div className="timer-controls">
          <button 
            className={`control-btn primary ${isRunning ? 'pause' : 'play'}`}
            onClick={toggleTimer}
          >
            {isRunning ? 'Pausar' : 'Comenzar'}
          </button>
          <button 
            className="control-btn secondary"
            onClick={resetTimer}
          >
            Reiniciar
          </button>
        </div>

        {/* Información */}
        <div className="pomodoro-info">
          <div className="info-item">
            <span className="info-label">Siguiente:</span>
            <span className="info-value">
              {mode === 'focus' 
                ? (sessions % 4 === 3 ? 'Descanso largo' : 'Descanso corto')
                : 'Sesión de enfoque'
              }
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Tiempo total hoy:</span>
            <span className="info-value">{sessions * 25} min</span>
          </div>
        </div>

        {/* Consejos */}
        <div className="pomodoro-tips">
          <h4>Consejos para mejor enfoque:</h4>
          <ul>
            <li>Elimina distracciones (notificaciones, redes sociales)</li>
            <li>Define una tarea específica antes de comenzar</li>
            <li>No rompas el timer, completa la sesión</li>
            <li>Usa los descansos para moverte o relajarte</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;