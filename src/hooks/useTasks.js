// hooks/useTasks.js
import { useState, useEffect } from 'react';
import { getDB } from '../database/DatabaseManager';

const useTasks = (selectedDate) => {
  const [tasks, setTasks] = useState([]);
  const db = getDB();

  const loadData = async () => {
    try {
      const allTasks = await db.getTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const addTask = async (taskData) => {
    try {
      await db.addTask(taskData);
      await loadData();
    } catch (error) {
      console.error('Error agregando tarea:', error);
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
      await db.deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  return { tasks, addTask, toggleTask, deleteTask, loadData };
};

export default useTasks;
