import { useState, useEffect } from 'react';

const useAdaptiveMode = () => {
  const [currentMode, setCurrentMode] = useState('morning');
  const [modeConfig, setModeConfig] = useState({});

  // Configuraciones para cada modo
  const modeConfigurations = {
    morning: {
      name: 'Modo Mañana',
      icon: '🌅',
      description: 'Enfoque en lo importante',
      timeRange: '6:00 - 12:00',
      primaryColor: '#f59e0b', // Amarillo cálido
      secondaryColor: '#fef3c7',
      theme: 'energetic',
      priorities: ['high', 'important'],
      suggestions: [
        'Tiempo perfecto para tareas complejas',
        'Tu mente está más clara ahora',
        'Ideal para decisiones importantes'
      ],
      taskFilter: {
        showCompleted: false,
        prioritizeCreative: true,
        limitTasks: 3,
        focusMode: true
      },
      greetings: [
        '¡Buenos días! Comencemos con energía 🚀',
        '¡Hora de conquistar el día! 💪',
        'Tu momento más productivo ha llegado ✨',
        '¡Vamos a hacer que este día sea increíble! 🌟'
      ],
      actionItems: [
        'Revisar prioridades del día',
        'Bloquear tiempo para trabajo profundo',
        'Completar la tarea más importante'
      ]
    },
    afternoon: {
      name: 'Modo Tarde',
      icon: '☀️',
      description: 'Tareas administrativas',
      timeRange: '12:00 - 18:00',
      primaryColor: '#3b82f6', // Azul profesional
      secondaryColor: '#dbeafe',
      theme: 'productive',
      priorities: ['administrative', 'meetings'],
      suggestions: [
        'Perfecto para reuniones y colaboración',
        'Momento ideal para tareas administrativas',
        'Aprovecha para comunicarte con tu equipo'
      ],
      taskFilter: {
        showCompleted: true,
        prioritizeAdmin: true,
        limitTasks: 5,
        focusMode: false
      },
      greetings: [
        '¡Buenas tardes! Mantengamos el momentum 📈',
        'Hora de organizar y colaborar 🤝',
        '¡Sigamos siendo productivos! 💼',
        'Aprovechemos esta energía constante ⚡'
      ],
      actionItems: [
        'Revisar correos y mensajes',
        'Actualizar el progreso de proyectos',
        'Programar reuniones pendientes'
      ]
    },
    evening: {
      name: 'Modo Noche',
      icon: '🌙',
      description: 'Planificación del mañana',
      timeRange: '18:00 - 6:00',
      primaryColor: '#6366f1', // Púrpura relajante
      secondaryColor: '#e0e7ff',
      theme: 'reflective',
      priorities: ['planning', 'review'],
      suggestions: [
        'Momento perfecto para reflexionar',
        'Planifica el día de mañana',
        'Revisa tus logros de hoy'
      ],
      taskFilter: {
        showCompleted: true,
        prioritizePlanning: true,
        limitTasks: 7,
        focusMode: false
      },
      greetings: [
        '¡Buenas noches! Hora de planificar 📝',
        'Reflexionemos sobre el día 🤔',
        '¡Preparemos un mañana exitoso! 🎯',
        'Momento de cerrar ciclos y planificar ✨'
      ],
      actionItems: [
        'Revisar logros del día',
        'Planificar tareas de mañana',
        'Preparar agenda para la semana'
      ]
    }
  };

  // Función para determinar el modo actual basado en la hora
  const getCurrentMode = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  };

  // Función para obtener saludo personalizado
  const getPersonalizedGreeting = (mode) => {
    const config = modeConfigurations[mode];
    const randomIndex = Math.floor(Math.random() * config.greetings.length);
    return config.greetings[randomIndex];
  };

  // Función para obtener tareas filtradas según el modo
  const getFilteredTasks = (tasks, mode) => {
    const config = modeConfigurations[mode];
    let filtered = [...tasks];

    // Filtrar según las preferencias del modo
    if (mode === 'morning') {
      // Priorizar tareas importantes y creativas
      filtered = filtered
        .filter(task => !config.taskFilter.showCompleted ? task.status !== 'completed' : true)
        .sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (b.priority === 'high' && a.priority !== 'high') return 1;
          return 0;
        })
        .slice(0, config.taskFilter.limitTasks);
    } else if (mode === 'afternoon') {
      // Mostrar tareas administrativas y de colaboración
      filtered = filtered
        .filter(task => task.type !== 'creative' || task.status === 'completed')
        .slice(0, config.taskFilter.limitTasks);
    } else if (mode === 'evening') {
      // Mostrar todas las tareas para revisión y planificación
      filtered = filtered.slice(0, config.taskFilter.limitTasks);
    }

    return filtered;
  };

  // Función para obtener insights específicos del modo
  const getModeInsights = (mode, tasks, stats) => {
    const config = modeConfigurations[mode];
    const insights = [];

    if (mode === 'morning') {
      if (stats.pending > 0) {
        insights.push(`🎯 Tienes ${stats.pending} tareas importantes esperándote`);
      }
      if (stats.highPriority > 0) {
        insights.push(`⚡ ${stats.highPriority} tareas de alta prioridad para hoy`);
      }
      insights.push('💡 Tu mente está en su mejor momento para tareas complejas');
    } else if (mode === 'afternoon') {
      const completedToday = tasks.filter(t => 
        t.status === 'completed' && 
        new Date(t.updated_at).toDateString() === new Date().toDateString()
      ).length;
      
      if (completedToday > 0) {
        insights.push(`✅ Ya completaste ${completedToday} tareas hoy, ¡excelente progreso!`);
      }
      insights.push('🤝 Momento ideal para colaboración y comunicación');
    } else if (mode === 'evening') {
      const todayProgress = Math.round((stats.completed / (stats.completed + stats.pending)) * 100) || 0;
      insights.push(`📊 Progreso de hoy: ${todayProgress}%`);
      insights.push('🌙 Momento perfecto para reflexionar y planificar');
      
      if (todayProgress >= 80) {
        insights.push('🎉 ¡Día excepcional! Mereces celebrar estos logros');
      }
    }

    return insights;
  };

  // Función para obtener recomendaciones de acciones
  const getModeActions = (mode) => {
    return modeConfigurations[mode].actionItems;
  };

  // Efecto para actualizar el modo automáticamente
  useEffect(() => {
    const updateMode = () => {
      const newMode = getCurrentMode();
      setCurrentMode(newMode);
      setModeConfig(modeConfigurations[newMode]);
    };

    // Actualizar inmediatamente
    updateMode();

    // Verificar cada minuto si cambió la hora
    const interval = setInterval(updateMode, 60000);

    return () => clearInterval(interval);
  }, []);

  // Función para cambiar manualmente el modo (para testing o preferencias del usuario)
  const setManualMode = (mode) => {
    if (modeConfigurations[mode]) {
      setCurrentMode(mode);
      setModeConfig(modeConfigurations[mode]);
      
      // Guardar preferencia manual
      localStorage.setItem('milari_manual_mode', mode);
      localStorage.setItem('milari_manual_mode_timestamp', Date.now().toString());
    }
  };

  // Función para resetear al modo automático
  const resetToAutoMode = () => {
    localStorage.removeItem('milari_manual_mode');
    localStorage.removeItem('milari_manual_mode_timestamp');
    
    const autoMode = getCurrentMode();
    setCurrentMode(autoMode);
    setModeConfig(modeConfigurations[autoMode]);
  };

  // Verificar si hay modo manual guardado y no ha expirado (2 horas)
  useEffect(() => {
    const manualMode = localStorage.getItem('milari_manual_mode');
    const timestamp = localStorage.getItem('milari_manual_mode_timestamp');
    
    if (manualMode && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (elapsed < twoHours && modeConfigurations[manualMode]) {
        setCurrentMode(manualMode);
        setModeConfig(modeConfigurations[manualMode]);
        return;
      } else {
        // Expiró el modo manual
        resetToAutoMode();
      }
    }
  }, []);

  return {
    currentMode,
    modeConfig,
    allModes: modeConfigurations,
    getPersonalizedGreeting,
    getFilteredTasks,
    getModeInsights,
    getModeActions,
    setManualMode,
    resetToAutoMode,
    getCurrentMode
  };
};

export default useAdaptiveMode;