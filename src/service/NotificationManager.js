class NotificationManager {
  constructor() {
    this.permission = null;
    this.activeNotifications = new Map();
    this.scheduledTimeouts = new Map();
    this.init();
  }

  async init() {
    // Verificar soporte para notificaciones
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return;
    }

    // Solicitar permisos
    await this.requestPermission();
    
    // Configurar service worker para notificaciones en background
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado para notificaciones');
      } catch (error) {
        console.log('Error registrando Service Worker:', error);
      }
    }
  }

  async requestPermission() {
    if (Notification.permission === 'default') {
      this.permission = await Notification.requestPermission();
    } else {
      this.permission = Notification.permission;
    }
    return this.permission === 'granted';
  }

  // Notificación inmediata
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Permisos de notificación no concedidos');
      return null;
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'mindflow-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-cerrar después de 5 segundos si no requiere interacción
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Eventos de la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };

      notification.onclose = () => {
        if (options.onClose) options.onClose();
      };

      return notification;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return null;
    }
  }

  // Programar notificación para una tarea
  scheduleTaskReminder(task) {
    if (!task.reminder_time && !task.scheduled_time) return;

    const reminderTime = task.reminder_time ? 
      new Date(task.reminder_time) : 
      new Date(task.scheduled_time);

    const now = new Date();
    const timeDiff = reminderTime.getTime() - now.getTime();

    // Solo programar si es en el futuro
    if (timeDiff <= 0) return;

    // Limpiar recordatorio anterior si existe
    if (this.scheduledTimeouts.has(task.id)) {
      clearTimeout(this.scheduledTimeouts.get(task.id));
    }

    // Programar nuevo recordatorio
    const timeoutId = setTimeout(() => {
      this.showTaskReminder(task);
      this.scheduledTimeouts.delete(task.id);
    }, timeDiff);

    this.scheduledTimeouts.set(task.id, timeoutId);

    console.log(`Recordatorio programado para "${task.text}" en ${reminderTime.toLocaleString()}`);
  }

  showTaskReminder(task) {
    const priorityEmojis = {
      urgent: '🔥',
      high: '⚡',
      normal: '⏰',
      low: '📝'
    };

    const emoji = priorityEmojis[task.priority] || '⏰';

    this.showNotification(`${emoji} Recordatorio de Tarea`, {
      body: task.text,
      tag: `task-${task.id}`,
      requireInteraction: task.priority === 'urgent',
      actions: [
        {
          action: 'complete',
          title: 'Marcar como completada'
        },
        {
          action: 'snooze',
          title: 'Recordar en 10 min'
        }
      ],
      data: { taskId: task.id, type: 'task-reminder' },
      onClick: () => {
        // Abrir la aplicación y navegar a la tarea
        window.location.hash = `#task-${task.id}`;
      }
    });
  }

  // Notificaciones de productividad
  showProductivityNotification(type, data) {
    const notifications = {
      dailyGoalReached: {
        title: '🎉 ¡Meta Diaria Alcanzada!',
        body: `Has completado ${data.completed} tareas hoy. ¡Excelente trabajo!`
      },
      streakMilestone: {
        title: '🔥 ¡Racha Increíble!',
        body: `${data.days} días consecutivos siendo productivo`
      },
      focusTimeReached: {
        title: '⏱️ Sesión de Enfoque Completada',
        body: `${data.minutes} minutos de trabajo enfocado`
      },
      weeklyReview: {
        title: '📊 Resumen Semanal',
        body: `Esta semana: ${data.completed}/${data.total} tareas completadas`
      }
    };

    const notification = notifications[type];
    if (notification) {
      this.showNotification(notification.title, {
        body: notification.body,
        tag: `productivity-${type}`,
        requireInteraction: false
      });
    }
  }

  // Recordatorios inteligentes
  scheduleIntelligentReminders(tasks) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // Recordatorio matutino (9 AM) con tareas del día
    const morningReminder = new Date(todayStart);
    morningReminder.setHours(9, 0, 0, 0);
    
    if (morningReminder > now) {
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.scheduled_time || task.created_at);
        return taskDate >= todayStart && taskDate < tomorrowStart && task.status === 'pending';
      });

      if (todayTasks.length > 0) {
        setTimeout(() => {
          this.showNotification('🌅 Buenos días', {
            body: `Tienes ${todayTasks.length} tareas programadas para hoy`,
            tag: 'morning-reminder',
            actions: [
              { action: 'view', title: 'Ver tareas' },
              { action: 'dismiss', title: 'Descartar' }
            ]
          });
        }, morningReminder.getTime() - now.getTime());
      }
    }

    // Recordatorio nocturno (8 PM) para revisar el día
    const eveningReminder = new Date(todayStart);
    eveningReminder.setHours(20, 0, 0, 0);
    
    if (eveningReminder > now) {
      setTimeout(() => {
        const completedToday = tasks.filter(task => {
          const completedDate = task.completed_at ? new Date(task.completed_at) : null;
          return completedDate && completedDate >= todayStart && completedDate < tomorrowStart;
        });

        this.showNotification('🌙 Revisión del Día', {
          body: `Completaste ${completedToday.length} tareas hoy. ¿Cómo te sientes?`,
          tag: 'evening-review',
          requireInteraction: true
        });
      }, eveningReminder.getTime() - now.getTime());
    }
  }

  // Gestión de recordatorios
  cancelTaskReminder(taskId) {
    if (this.scheduledTimeouts.has(taskId)) {
      clearTimeout(this.scheduledTimeouts.get(taskId));
      this.scheduledTimeouts.delete(taskId);
      console.log(`Recordatorio cancelado para tarea ${taskId}`);
    }
  }

  updateTaskReminder(task) {
    this.cancelTaskReminder(task.id);
    this.scheduleTaskReminder(task);
  }

  // Limpiar todas las notificaciones programadas
  clearAllReminders() {
    this.scheduledTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledTimeouts.clear();
  }

  // Estado del servicio
  getStatus() {
    return {
      permission: this.permission,
      supported: 'Notification' in window,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      activeReminders: this.scheduledTimeouts.size
    };
  }

  // Configuración de notificaciones
  async configure(settings) {
    // Guardar configuraciones del usuario
    localStorage.setItem('notification-settings', JSON.stringify({
      morning: settings.morning ?? true,
      evening: settings.evening ?? true,
      taskReminders: settings.taskReminders ?? true,
      productivity: settings.productivity ?? true,
      sound: settings.sound ?? true,
      ...settings
    }));
  }

  getSettings() {
    const defaultSettings = {
      morning: true,
      evening: true,
      taskReminders: true,
      productivity: true,
      sound: true
    };

    try {
      const saved = localStorage.getItem('notification-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }
}

// Singleton instance
let notificationManager = null;

export const getNotificationManager = () => {
  if (!notificationManager) {
    notificationManager = new NotificationManager();
  }
  return notificationManager;
};

export default NotificationManager;