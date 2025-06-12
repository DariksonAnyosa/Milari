// hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../database/DatabaseManager';
import { getNotificationManager } from '../service/NotificationManager';

const useTasks = (selectedDate) => {
  const [tasks, setTasks] = useState([]);
  const db = getDB();
  const notificationManager = getNotificationManager();

  const loadData = useCallback(async () => {
    try {
      const allTasks = await db.getTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, [db]);

  const addTask = async (taskData) => {
    try {
      const newTask = await db.addTask(taskData);
      
      // Programar recordatorio si tiene fecha/hora
      if (newTask.reminder_time || newTask.scheduled_time) {
        notificationManager.scheduleTaskReminder(newTask);
        console.log('📅 Recordatorio programado para:', newTask.text);
      }
      
      await loadData();
      return newTask;
    } catch (error) {
      console.error('Error agregando tarea:', error);
      throw error;
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task.status === 'pending') {
        await db.completeTask(taskId, '😊');
      } else {
        await db.updateTaskStatus(taskId, 'pending');
      }
      await loadData();
    } catch (error) {
      console.error('Error actualizando tarea:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Cancelar recordatorio antes de eliminar
      notificationManager.cancelTaskReminder(taskId);
      
      await db.deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, loadData]);

  // Configurar recordatorios para todas las tareas pendientes
  useEffect(() => {
    const setupReminders = () => {
      const pendingTasks = tasks.filter(task => 
        task.status === 'pending' && 
        (task.reminder_time || task.scheduled_time)
      );
      
      pendingTasks.forEach(task => {
        notificationManager.scheduleTaskReminder(task);
      });
      
      // Recordatorios inteligentes (mañana y noche)
      notificationManager.scheduleIntelligentReminders(tasks);
      
      console.log(`📋 Configurados ${pendingTasks.length} recordatorios`);
    };
    
    if (tasks.length > 0) {
      setupReminders();
    }
  }, [tasks, notificationManager]);

  return { tasks, addTask, toggleTask, deleteTask, loadData };
};

export default useTasks;
