// ai/RecommendationEngine.js - Motor de recomendaciones inteligentes
import PatternAnalyzer from './PatternAnalyzer';
import { getDB } from '../database/DatabaseManager';

class RecommendationEngine {
  constructor() {
    this.patternAnalyzer = new PatternAnalyzer();
    this.db = getDB();
  }

  // Generar recomendaciones basadas en patrones
  async generateRecommendations() {
    const insights = await this.patternAnalyzer.generateAllInsights();
    const pendingTasks = await this.db.getTasks({ status: 'pending' });
    const recommendations = [];

    // Recomendación basada en horario productivo
    const productiveHours = insights.find(i => i.type === 'productive_hours');
    if (productiveHours && pendingTasks.length > 0) {
      const currentHour = new Date().getHours();
      const optimalHour = productiveHours.hour;
      
      if (Math.abs(currentHour - optimalHour) <= 1) {
        // Estamos en hora productiva
        const importantTasks = pendingTasks.filter(task => 
          task.priority === 'high' || task.text.length > 20
        );
        
        if (importantTasks.length > 0) {
          recommendations.push({
            type: 'optimal_timing',
            priority: 'high',
            title: '⚡ Es tu hora más productiva',
            message: `Estás en tu mejor momento del día. Recomiendo empezar con "${importantTasks[0].text}"`,
            action: 'start_task',
            taskId: importantTasks[0].id,
            confidence: productiveHours.confidence
          });
        }
      } else {
        // Planificar para hora productiva
        const nextProductiveTime = this.getNextProductiveTime(optimalHour);
        recommendations.push({
          type: 'schedule_optimization',
          priority: 'medium',
          title: '🎯 Optimiza tu planificación',
          message: `Tu mejor momento es a las ${optimalHour}:00. ¿Programamos las tareas importantes para ${nextProductiveTime}?`,
          action: 'reschedule_tasks',
          suggestedTime: this.getNextProductiveDateTime(optimalHour),
          confidence: productiveHours.confidence
        });
      }
    }

    // Recomendación de balance de carga
    if (pendingTasks.length > 5) {
      const todayTasks = pendingTasks.filter(task => {
        const taskDate = task.scheduled_time ? new Date(task.scheduled_time) : new Date();
        return this.isToday(taskDate);
      });

      if (todayTasks.length > 6) {
        recommendations.push({
          type: 'workload_balance',
          priority: 'medium',
          title: '📊 Sobrecarga detectada',
          message: `Tienes ${todayTasks.length} tareas para hoy. Considera mover ${todayTasks.length - 4} para mañana`,
          action: 'redistribute_tasks',
          tasksToMove: todayTasks.slice(4),
          confidence: 0.8
        });
      }
    }

    // Recomendación basada en racha
    const streak = insights.find(i => i.type === 'completion_streak');
    if (streak) {
      if (streak.currentStreak === 0) {
        recommendations.push({
          type: 'streak_motivation',
          priority: 'high',
          title: '🚀 ¡Comienza una nueva racha!',
          message: 'Completa una tarea pequeña para empezar una nueva racha de productividad',
          action: 'start_streak',
          suggestedTasks: pendingTasks
            .filter(task => task.text.length < 30)
            .slice(0, 3),
          confidence: 0.9
        });
      } else if (streak.currentStreak >= 3) {
        recommendations.push({
          type: 'streak_continuation',
          priority: 'medium',
          title: `🔥 ¡Racha de ${streak.currentStreak} días!`,
          message: '¡No rompas la racha! Completa al menos una tarea hoy',
          action: 'maintain_streak',
          confidence: streak.confidence
        });
      }
    }

    // Recomendación basada en día productivo
    const productiveDays = insights.find(i => i.type === 'productive_days');
    if (productiveDays) {
      const today = new Date().getDay();
      const isProductiveDay = today === productiveDays.day;
      
      if (isProductiveDay && pendingTasks.length > 0) {
        recommendations.push({
          type: 'productive_day',
          priority: 'high',
          title: `⭐ ¡Hoy es tu día más productivo!`,
          message: `Los ${productiveDays.dayName}s rindes ${productiveDays.percentage}% mejor. ¡Aprovecha el día!`,
          action: 'maximize_day',
          suggestedTasks: pendingTasks.slice(0, 5),
          confidence: productiveDays.confidence
        });
      }
    }

    // Recomendación anti-procrastinación
    const procrastination = insights.find(i => i.type === 'procrastination_patterns');
    if (procrastination && procrastination.procrastinationRate > 30) {
      const longTasks = pendingTasks.filter(task => task.text.length > 40);
      if (longTasks.length > 0) {
        recommendations.push({
          type: 'anti_procrastination',
          priority: 'medium',
          title: '✂️ Divide y vencerás',
          message: `Sueles retrasar tareas largas. ¿Dividimos "${longTasks[0].text}" en partes más pequeñas?`,
          action: 'break_down_task',
          taskId: longTasks[0].id,
          confidence: procrastination.confidence
        });
      }
    }

    // Recomendación de celebración
    const weeklyTrends = insights.find(i => i.type === 'weekly_trends');
    if (weeklyTrends && weeklyTrends.improvement > 20) {
      recommendations.push({
        type: 'celebration',
        priority: 'low',
        title: '🎉 ¡Progreso increíble!',
        message: `Has mejorado ${weeklyTrends.improvement}% esta semana. ¡Sigue así!`,
        action: 'celebrate',
        confidence: weeklyTrends.confidence
      });
    }

    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3); // Máximo 3 recomendaciones para no abrumar
  }

  // Ejecutar acción de recomendación
  async executeRecommendation(recommendation) {
    switch (recommendation.action) {
      case 'start_task':
        // Marcar tarea como en progreso o mostrar focus mode
        return { success: true, message: 'Tarea iniciada' };
        
      case 'reschedule_tasks':
        // Reprogramar tareas para hora óptima
        return this.rescheduleTasksToOptimalTime(recommendation.suggestedTime);
        
      case 'redistribute_tasks':
        // Mover tareas para mañana
        return this.redistributeTasks(recommendation.tasksToMove);
        
      case 'break_down_task':
        // Sugerir división de tarea
        return { 
          success: true, 
          message: 'Abre el editor de tareas para dividir esta tarea',
          showTaskEditor: true,
          taskId: recommendation.taskId
        };
        
      default:
        return { success: true, message: 'Recomendación aceptada' };
    }
  }

  // Utilities
  async rescheduleTasksToOptimalTime(suggestedTime) {
    // Implementar lógica de reprogramación
    return { success: true, message: 'Tareas reprogramadas para tu hora más productiva' };
  }

  async redistributeTasks(tasksToMove) {
    // Implementar redistribución de tareas
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    for (const task of tasksToMove) {
      await this.db.updateTask(task.id, {
        scheduled_time: tomorrow.toISOString()
      });
    }

    return { 
      success: true, 
      message: `${tasksToMove.length} tareas movidas para mañana`
    };
  }

  getNextProductiveTime(optimalHour) {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < optimalHour) {
      return 'hoy';
    } else {
      return 'mañana';
    }
  }

  getNextProductiveDateTime(optimalHour) {
    const date = new Date();
    if (date.getHours() >= optimalHour) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(optimalHour, 0, 0, 0);
    return date;
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}

export default RecommendationEngine;