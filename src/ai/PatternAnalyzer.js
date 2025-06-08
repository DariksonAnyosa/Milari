// ai/PatternAnalyzer.js - Motor de análisis de patrones de productividad
import { getDB } from '../database/DatabaseManager';

class PatternAnalyzer {
  constructor() {
    this.db = getDB();
  }

  // Analizar horarios más productivos del usuario
  async analyzeProductiveHours() {
    try {
      const tasks = await this.db.getTasks();
      const completedTasks = tasks.filter(task => task.status === 'completed');
      
      if (completedTasks.length < 5) {
        return null; // Necesitamos más datos
      }

      // Agrupar por hora de completado
      const hourlyStats = {};
      
      completedTasks.forEach(task => {
        if (task.completed_at) {
          const hour = new Date(task.completed_at).getHours();
          hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
        }
      });

      // Encontrar la hora más productiva
      const productiveHour = Object.entries(hourlyStats)
        .sort(([,a], [,b]) => b - a)[0];

      if (!productiveHour) return null;

      const [hour, completions] = productiveHour;
      const totalCompletions = completedTasks.length;
      const percentage = Math.round((completions / totalCompletions) * 100);

      return {
        type: 'productive_hours',
        hour: parseInt(hour),
        completions,
        percentage,
        confidence: Math.min(completions / 10, 1), // Más datos = más confianza
        timeRange: this.getTimeRange(parseInt(hour)),
        insight: `Eres ${percentage}% más productivo a las ${hour}:00`
      };
    } catch (error) {
      console.error('Error analizando horarios productivos:', error);
      return null;
    }
  }

  // Analizar días de la semana más productivos
  async analyzeProductiveDays() {
    try {
      const tasks = await this.db.getTasks();
      const completedTasks = tasks.filter(task => task.status === 'completed');
      
      if (completedTasks.length < 7) {
        return null;
      }

      const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const dailyStats = {};

      completedTasks.forEach(task => {
        if (task.completed_at) {
          const dayOfWeek = new Date(task.completed_at).getDay();
          dailyStats[dayOfWeek] = (dailyStats[dayOfWeek] || 0) + 1;
        }
      });

      const productiveDay = Object.entries(dailyStats)
        .sort(([,a], [,b]) => b - a)[0];

      if (!productiveDay) return null;

      const [dayIndex, completions] = productiveDay;
      const dayName = dayNames[parseInt(dayIndex)];
      const percentage = Math.round((completions / completedTasks.length) * 100);

      return {
        type: 'productive_days',
        day: parseInt(dayIndex),
        dayName,
        completions,
        percentage,
        confidence: Math.min(completions / 5, 1),
        insight: `Los ${dayName}s completas ${percentage}% más tareas`
      };
    } catch (error) {
      console.error('Error analizando días productivos:', error);
      return null;
    }
  }

  // Analizar racha de completado
  async analyzeCompletionStreak() {
    try {
      const tasks = await this.db.getTasks();
      const completedTasks = tasks
        .filter(task => task.status === 'completed' && task.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

      if (completedTasks.length === 0) return null;

      let currentStreak = 0;
      let maxStreak = 0;
      let streakDays = new Set();
      
      // Analizar últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      completedTasks.forEach(task => {
        const taskDate = new Date(task.completed_at);
        if (taskDate >= thirtyDaysAgo) {
          const dateStr = taskDate.toDateString();
          streakDays.add(dateStr);
        }
      });

      // Calcular racha actual
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        if (streakDays.has(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        type: 'completion_streak',
        currentStreak,
        totalActiveDays: streakDays.size,
        confidence: Math.min(currentStreak / 7, 1),
        insight: currentStreak > 0 
          ? `Racha actual: ${currentStreak} días consecutivos`
          : 'Comienza una nueva racha hoy'
      };
    } catch (error) {
      console.error('Error analizando racha:', error);
      return null;
    }
  }

  // Analizar tendencias semanales
  async analyzeWeeklyTrends() {
    try {
      const tasks = await this.db.getTasks();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const thisWeekTasks = tasks.filter(task => {
        const taskDate = task.completed_at ? new Date(task.completed_at) : new Date(task.created_at);
        return taskDate >= lastWeek;
      });

      const lastWeekTasks = tasks.filter(task => {
        const taskDate = task.completed_at ? new Date(task.completed_at) : new Date(task.created_at);
        return taskDate >= twoWeeksAgo && taskDate < lastWeek;
      });

      const thisWeekCompleted = thisWeekTasks.filter(t => t.status === 'completed').length;
      const lastWeekCompleted = lastWeekTasks.filter(t => t.status === 'completed').length;

      if (lastWeekCompleted === 0) return null;

      const improvement = ((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100;

      return {
        type: 'weekly_trends',
        thisWeek: thisWeekCompleted,
        lastWeek: lastWeekCompleted,
        improvement: Math.round(improvement),
        confidence: Math.min((thisWeekCompleted + lastWeekCompleted) / 10, 1),
        insight: improvement > 0 
          ? `Has mejorado ${Math.round(Math.abs(improvement))}% esta semana`
          : improvement < -10
          ? `Esta semana ha sido más difícil, ¡mañana será mejor!`
          : 'Productividad estable esta semana'
      };
    } catch (error) {
      console.error('Error analizando tendencias:', error);
      return null;
    }
  }

  // Analizar patrones de procrastinación
  async analyzeProcrastinationPatterns() {
    try {
      const tasks = await this.db.getTasks();
      const allTasks = tasks.filter(task => task.scheduled_time);

      if (allTasks.length < 5) return null;

      let delayedTasks = 0;
      let totalDelay = 0;

      allTasks.forEach(task => {
        if (task.completed_at && task.scheduled_time) {
          const scheduled = new Date(task.scheduled_time);
          const completed = new Date(task.completed_at);
          const delay = (completed - scheduled) / (1000 * 60 * 60); // horas

          if (delay > 1) { // Más de 1 hora de retraso
            delayedTasks++;
            totalDelay += delay;
          }
        }
      });

      const procrastinationRate = (delayedTasks / allTasks.length) * 100;
      const avgDelay = delayedTasks > 0 ? totalDelay / delayedTasks : 0;

      return {
        type: 'procrastination_patterns',
        delayedTasks,
        totalTasks: allTasks.length,
        procrastinationRate: Math.round(procrastinationRate),
        avgDelay: Math.round(avgDelay),
        confidence: Math.min(allTasks.length / 10, 1),
        insight: procrastinationRate > 50 
          ? `Sueles retrasar ${Math.round(procrastinationRate)}% de tus tareas`
          : procrastinationRate > 20
          ? 'Ocasionalmente retrasas algunas tareas'
          : '¡Excelente! Cumples tus horarios programados'
      };
    } catch (error) {
      console.error('Error analizando procrastinación:', error);
      return null;
    }
  }

  // Generar todos los insights disponibles
  async generateAllInsights() {
    const insights = await Promise.all([
      this.analyzeProductiveHours(),
      this.analyzeProductiveDays(),
      this.analyzeCompletionStreak(),
      this.analyzeWeeklyTrends(),
      this.analyzeProcrastinationPatterns()
    ]);

    return insights
      .filter(insight => insight !== null)
      .sort((a, b) => b.confidence - a.confidence); // Ordenar por confianza
  }

  // Utilities
  getTimeRange(hour) {
    if (hour >= 6 && hour < 12) return 'mañana';
    if (hour >= 12 && hour < 18) return 'tarde';
    if (hour >= 18 && hour < 22) return 'noche';
    return 'madrugada';
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}

export default PatternAnalyzer;