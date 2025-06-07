// hooks/useStats.js
import { useState, useEffect } from 'react';
import { getDB } from '../database/DatabaseManager';

const useStats = (tasks) => {
  const [todayStats, setTodayStats] = useState({
    tasksToday: 0,
    completed: 0,
    pending: 0,
    reminders: 0
  });

  const db = getDB();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await db.getTodayStats();
        setTodayStats(stats);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    loadStats();
  }, [tasks]);

  return { todayStats };
};

export default useStats;