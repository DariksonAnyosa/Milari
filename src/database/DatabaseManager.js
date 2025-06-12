// DatabaseManager mejorado para MILARI
// Simulación de base de datos con localStorage más robusta

class DatabaseManager {
  constructor() {
    this.storageKey = 'milari_data'; // Actualizado de 'mindflow_data'
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
        lastId: 0,
        version: '1.0.0'
      };
      this.saveData(initialData);
    }
  }

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error leyendo datos:', error);
      return {};
    }
  }

  saveData(data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('📦 localStorage lleno. Limpiando datos antiguos...');
        this.cleanOldData();
        // Reintentar una vez
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (retryError) {
          console.error('❌ No se pudo guardar después de limpiar:', retryError);
          throw new Error('No hay espacio suficiente para guardar los datos');
        }
      } else {
        console.error('❌ Error guardando datos:', error);
        throw error;
      }
    }
  }

  // Limpiar datos antiguos para liberar espacio
  cleanOldData() {
    try {
      const data = this.getData();
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Mantener solo tareas del último mes
      const recentTasks = data.tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate > oneMonthAgo || task.status === 'pending';
      });
      
      // Mantener solo comandos de voz recientes
      const recentCommands = (data.voiceCommands || []).slice(-100);
      
      const cleanedData = {
        ...data,
        tasks: recentTasks,
        voiceCommands: recentCommands
      };
      
      console.log(`🧹 Datos limpiados: ${data.tasks.length - recentTasks.length} tareas eliminadas`);
      this.saveData(cleanedData);
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  }

  generateId() {
    const data = this.getData();
    data.lastId = (data.lastId || 0) + 1;
    this.saveData(data);
    return data.lastId;
  }

  // Métodos para tareas con validación mejorada
  addTask(taskData) {
    return new Promise((resolve, reject) => {
      try {
        // Validación de entrada
        if (!taskData || typeof taskData !== 'object') {
          reject(new Error('Datos de tarea inválidos'));
          return;
        }
        
        if (!taskData.text || typeof taskData.text !== 'string' || taskData.text.trim().length === 0) {
          reject(new Error('El texto de la tarea es requerido'));
          return;
        }
        
        if (taskData.text.trim().length > 500) {
          reject(new Error('El texto de la tarea es demasiado largo (máximo 500 caracteres)'));
          return;
        }
        
        const data = this.getData();
        const task = {
          id: this.generateId(),
          text: taskData.text.trim(),
          type: taskData.type || 'task',
          priority: ['low', 'normal', 'high', 'urgent'].includes(taskData.priority) ? taskData.priority : 'normal',
          status: 'pending',
          scheduled_time: taskData.scheduled_time || null,
          created_at: new Date().toISOString(),
          completed_at: null,
          reminder_time: taskData.reminder_time || null,
          notes: (taskData.notes || '').toString().trim(),
          emotion: null,
          estimated_duration: taskData.estimated_duration || null,
          actual_duration: null,
          tags: Array.isArray(taskData.tags) ? taskData.tags : []
        };

        data.tasks.push(task);
        this.saveData(data);
        console.log('✅ Tarea agregada:', task.text);
        resolve(task);
      } catch (error) {
        console.error('❌ Error agregando tarea:', error);
        reject(error);
      }
    });
  }

  getTasks(filters = {}) {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        console.error('❌ Error obteniendo tareas:', error);
        reject(error);
      }
    });
  }

  updateTaskStatus(taskId, newStatus) {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        console.error('❌ Error actualizando tarea:', error);
        reject(error);
      }
    });
  }

  completeTask(taskId, emotion = null, actualDuration = null) {
    return new Promise((resolve, reject) => {
      try {
        const data = this.getData();
        const taskIndex = data.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          data.tasks[taskIndex].status = 'completed';
          data.tasks[taskIndex].completed_at = new Date().toISOString();
          data.tasks[taskIndex].emotion = emotion;
          data.tasks[taskIndex].actual_duration = actualDuration;
          
          this.saveData(data);
          console.log('✅ Tarea completada:', data.tasks[taskIndex].text);
          resolve({ changes: 1 });
        } else {
          resolve({ changes: 0 });
        }
      } catch (error) {
        console.error('❌ Error completando tarea:', error);
        reject(error);
      }
    });
  }

  deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      try {
        const data = this.getData();
        const initialLength = data.tasks.length;
        const taskToDelete = data.tasks.find(task => task.id === taskId);
        
        data.tasks = data.tasks.filter(task => task.id !== taskId);
        
        this.saveData(data);
        const deletedCount = initialLength - data.tasks.length;
        
        if (deletedCount > 0 && taskToDelete) {
          console.log('🗑️ Tarea eliminada:', taskToDelete.text);
        }
        
        resolve({ changes: deletedCount });
      } catch (error) {
        console.error('❌ Error eliminando tarea:', error);
        reject(error);
      }
    });
  }

  // Métodos para comandos de voz
  logVoiceCommand(command, intent, confidence, taskId = null) {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        console.error('❌ Error registrando comando de voz:', error);
        reject(error);
      }
    });
  }

  // Métodos para estadísticas
  getTodayStats() {
    return new Promise((resolve, reject) => {
      try {
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
        }).catch(reject);
      } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        reject(error);
      }
    });
  }

  // Buscar tareas por texto
  searchTasks(query) {
    return new Promise((resolve, reject) => {
      try {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
          resolve([]);
          return;
        }
        
        this.getTasks().then(tasks => {
          const searchTerm = query.toLowerCase().trim();
          const results = tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            (task.notes && task.notes.toLowerCase().includes(searchTerm)) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
          resolve(results);
        }).catch(reject);
      } catch (error) {
        console.error('❌ Error buscando tareas:', error);
        reject(error);
      }
    });
  }

  // Obtener tareas pendientes de días anteriores
  getPendingFromPreviousDays() {
    return new Promise((resolve, reject) => {
      try {
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
        }).catch(reject);
      } catch (error) {
        console.error('❌ Error obteniendo tareas atrasadas:', error);
        reject(error);
      }
    });
  }

  // Migrar datos de versión anterior
  migrateFromOldVersion() {
    try {
      const oldData = localStorage.getItem('mindflow_data');
      if (oldData && !localStorage.getItem(this.storageKey)) {
        console.log('🔄 Migrando datos de versión anterior...');
        const parsedOldData = JSON.parse(oldData);
        this.saveData({ ...parsedOldData, version: '1.0.0' });
        console.log('✅ Migración completada');
      }
    } catch (error) {
      console.error('❌ Error en migración:', error);
    }
  }

  // Limpiar datos (para testing)
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('mindflow_data'); // Limpiar versión anterior también
      this.initializeStorage();
      console.log('🧹 Todos los datos han sido eliminados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
      throw error;
    }
  }

  // Obtener información del estado de la base de datos
  getStorageInfo() {
    try {
      const data = this.getData();
      const dataSize = JSON.stringify(data).length;
      
      return {
        storageKey: this.storageKey,
        tasksCount: data.tasks?.length || 0,
        voiceCommandsCount: data.voiceCommands?.length || 0,
        dataSizeKB: Math.round(dataSize / 1024),
        lastId: data.lastId || 0,
        version: data.version || 'unknown'
      };
    } catch (error) {
      console.error('❌ Error obteniendo info de almacenamiento:', error);
      return null;
    }
  }
}

// Singleton instance
let dbInstance = null;

export const getDB = () => {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
    // Intentar migración automática
    dbInstance.migrateFromOldVersion();
  }
  return dbInstance;
};

export default DatabaseManager;
