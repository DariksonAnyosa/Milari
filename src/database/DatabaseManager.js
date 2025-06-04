// Como estamos en el navegador (React), simulamos la base de datos con localStorage
// En una versión completa, esto se comunicaría con Electron para usar SQLite real

class DatabaseManager {
  constructor() {
    this.storageKey = 'mindflow_data';
    this.initializeStorage();
  }

  initializeStorage() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      const initialData = {
        tasks: [],
        voiceCommands: [],
        dailyStats: {},
        userConfig: {},
        lastId: 0
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  generateId() {
    const data = this.getData();
    data.lastId = (data.lastId || 0) + 1;
    this.saveData(data);
    return data.lastId;
  }

  // Métodos para tareas
  addTask(taskData) {
    return new Promise((resolve) => {
      const data = this.getData();
      const task = {
        id: this.generateId(),
        text: taskData.text,
        type: taskData.type || 'task',
        priority: taskData.priority || 'normal',
        status: 'pending',
        scheduled_time: taskData.scheduled_time || null,
        created_at: new Date().toISOString(),
        completed_at: null,
        reminder_time: taskData.reminder_time || null,
        notes: taskData.notes || '',
        emotion: null,
        estimated_duration: taskData.estimated_duration || null,
        actual_duration: null,
        tags: taskData.tags || []
      };

      data.tasks.push(task);
      this.saveData(data);
      resolve(task);
    });
  }

  getTasks(filters = {}) {
    return new Promise((resolve) => {
      const data = this.getData();
      let tasks = data.tasks || [];

      // Aplicar filtros
      if (filters.status) {
        tasks = tasks.filter(task => task.status === filters.status);
      }

      if (filters.date) {
        tasks = tasks.filter(task => {
          if (!task.scheduled_time) return false;
          const taskDate = new Date(task.scheduled_time).toDateString();
          const filterDate = new Date(filters.date).toDateString();
          return taskDate === filterDate;
        });
      }

      if (filters.priority) {
        const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
        const minPriority = priorityOrder[filters.priority] || 1;
        tasks = tasks.filter(task => (priorityOrder[task.priority] || 2) >= minPriority);
      }

      // Ordenar por prioridad y fecha
      tasks.sort((a, b) => {
        const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Mayor prioridad primero
        }
        
        // Si tienen la misma prioridad, ordenar por fecha
        const aDate = new Date(a.scheduled_time || a.created_at);
        const bDate = new Date(b.scheduled_time || b.created_at);
        return aDate - bDate;
      });

      resolve(tasks);
    });
  }

  updateTaskStatus(taskId, newStatus) {
    return new Promise((resolve) => {
      const data = this.getData();
      const taskIndex = data.tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        data.tasks[taskIndex].status = newStatus;
        if (newStatus === 'completed') {
          data.tasks[taskIndex].completed_at = new Date().toISOString();
        } else {
          data.tasks[taskIndex].completed_at = null;
        }
        
        this.saveData(data);
        resolve({ changes: 1 });
      } else {
        resolve({ changes: 0 });
      }
    });
  }

  completeTask(taskId, emotion = null, actualDuration = null) {
    return new Promise((resolve) => {
      const data = this.getData();
      const taskIndex = data.tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        data.tasks[taskIndex].status = 'completed';
        data.tasks[taskIndex].completed_at = new Date().toISOString();
        data.tasks[taskIndex].emotion = emotion;
        data.tasks[taskIndex].actual_duration = actualDuration;
        
        this.saveData(data);
        resolve({ changes: 1 });
      } else {
        resolve({ changes: 0 });
      }
    });
  }

  deleteTask(taskId) {
    return new Promise((resolve) => {
      const data = this.getData();
      const initialLength = data.tasks.length;
      data.tasks = data.tasks.filter(task => task.id !== taskId);
      
      this.saveData(data);
      resolve({ changes: initialLength - data.tasks.length });
    });
  }

  // Métodos para comandos de voz
  logVoiceCommand(command, intent, confidence, taskId = null) {
    return new Promise((resolve) => {
      const data = this.getData();
      const voiceCommand = {
        id: this.generateId(),
        raw_command: command,
        parsed_intent: intent,
        confidence: confidence,
        success: true,
        created_at: new Date().toISOString(),
        task_id: taskId
      };

      if (!data.voiceCommands) data.voiceCommands = [];
      data.voiceCommands.push(voiceCommand);
      this.saveData(data);
      resolve({ id: voiceCommand.id });
    });
  }

  // Métodos para estadísticas
  getTodayStats() {
    return new Promise((resolve) => {
      const today = new Date().toDateString();
      this.getTasks().then(allTasks => {
        const todayTasks = allTasks.filter(task => {
          const taskDate = task.scheduled_time ? 
            new Date(task.scheduled_time).toDateString() : 
            new Date(task.created_at).toDateString();
          return taskDate === today;
        });

        const completed = todayTasks.filter(task => task.status === 'completed');
        const pending = todayTasks.filter(task => task.status === 'pending');
        const reminders = allTasks.filter(task => task.reminder_time && task.status === 'pending');

        resolve({
          tasksToday: todayTasks.length,
          completed: completed.length,
          pending: pending.length,
          reminders: reminders.length,
          completionRate: todayTasks.length > 0 ? (completed.length / todayTasks.length) * 100 : 0
        });
      });
    });
  }

  // Buscar tareas por texto
  searchTasks(query) {
    return new Promise((resolve) => {
      this.getTasks().then(tasks => {
        const searchTerm = query.toLowerCase();
        const results = tasks.filter(task => 
          task.text.toLowerCase().includes(searchTerm) ||
          (task.notes && task.notes.toLowerCase().includes(searchTerm)) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        resolve(results);
      });
    });
  }

  // Obtener tareas pendientes de días anteriores
  getPendingFromPreviousDays() {
    return new Promise((resolve) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.getTasks({ status: 'pending' }).then(pendingTasks => {
        const overdue = pendingTasks.filter(task => {
          if (!task.scheduled_time) return false;
          const taskDate = new Date(task.scheduled_time);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate < today;
        });
        resolve(overdue);
      });
    });
  }

  // Limpiar datos (para testing)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    this.initializeStorage();
  }
}

// Singleton instance
let dbInstance = null;

export const getDB = () => {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
};

export default DatabaseManager;