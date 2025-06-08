// hooks/useAI.js - Hook para integrar la IA en componentes
import { useState, useEffect, useCallback } from 'react';
import PatternAnalyzer from '../ai/PatternAnalyzer';
import RecommendationEngine from '../ai/RecommendationEngine';

const useAI = (tasks, refreshInterval = 30000) => { // Actualizar cada 30 segundos
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Instancias de los motores de IA
  const patternAnalyzer = new PatternAnalyzer();
  const recommendationEngine = new RecommendationEngine();

  // Función principal de análisis
  const analyzeUserData = useCallback(async () => {
    if (isAnalyzing) return; // Evitar análisis simultáneos
    
    setIsAnalyzing(true);
    
    try {
      console.log('🧠 Iniciando análisis de patrones...');
      
      // Generar insights de patrones
      const newInsights = await patternAnalyzer.generateAllInsights();
      console.log('📊 Insights generados:', newInsights);
      
      // Generar recomendaciones
      const newRecommendations = await recommendationEngine.generateRecommendations();
      console.log('💡 Recomendaciones generadas:', newRecommendations);
      
      setInsights(newInsights);
      setRecommendations(newRecommendations);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error en análisis de IA:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Ejecutar recomendación
  const executeRecommendation = useCallback(async (recommendation) => {
    try {
      const result = await recommendationEngine.executeRecommendation(recommendation);
      
      // Remover recomendación ejecutada
      setRecommendations(prev => 
        prev.filter(rec => rec !== recommendation)
      );
      
      // Re-analizar después de ejecutar acción
      setTimeout(analyzeUserData, 1000);
      
      return result;
    } catch (error) {
      console.error('Error ejecutando recomendación:', error);
      return { success: false, message: 'Error ejecutando recomendación' };
    }
  }, [analyzeUserData]);

  // Descartar recomendación
  const dismissRecommendation = useCallback((recommendation) => {
    setRecommendations(prev => 
      prev.filter(rec => rec !== recommendation)
    );
  }, []);

  // Obtener insight principal para mostrar en hero
  const getPrimaryInsight = useCallback(() => {
    if (insights.length === 0) return null;
    
    // Priorizar insights con mayor confianza
    const sortedInsights = [...insights].sort((a, b) => b.confidence - a.confidence);
    return sortedInsights[0];
  }, [insights]);

  // Obtener recomendación principal
  const getPrimaryRecommendation = useCallback(() => {
    if (recommendations.length === 0) return null;
    
    // Priorizar por prioridad y confianza
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      return highPriorityRecs[0];
    }
    
    return recommendations[0];
  }, [recommendations]);

  // Obtener saludo personalizado
  const getPersonalizedGreeting = useCallback(() => {
    const greeting = patternAnalyzer.getGreeting();
    const primaryInsight = getPrimaryInsight();
    
    if (!primaryInsight) {
      return `${greeting}, Darikson`;
    }
    
    // Personalizar saludo basado en insights
    switch (primaryInsight.type) {
      case 'productive_hours':
        return `${greeting}, Darikson! Es tu hora más productiva 🚀`;
      case 'completion_streak':
        return `${greeting}, Darikson! Racha de ${primaryInsight.currentStreak} días 🔥`;
      case 'weekly_trends':
        if (primaryInsight.improvement > 0) {
          return `${greeting}, Darikson! +${primaryInsight.improvement}% esta semana 📈`;
        }
        break;
      default:
        return `${greeting}, Darikson`;
    }
    
    return `${greeting}, Darikson`;
  }, [getPrimaryInsight]);

  // Estadísticas de IA para mostrar
  const getAIStats = useCallback(() => {
    return {
      totalInsights: insights.length,
      totalRecommendations: recommendations.length,
      lastUpdate,
      confidence: insights.length > 0 
        ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100)
        : 0
    };
  }, [insights, recommendations, lastUpdate]);

  // Efectos
  useEffect(() => {
    // Análisis inicial cuando cambian las tareas
    if (tasks && tasks.length > 0) {
      analyzeUserData();
    }
  }, [tasks, analyzeUserData]);

  useEffect(() => {
    // Análisis periódico
    const interval = setInterval(() => {
      if (tasks && tasks.length > 0) {
        analyzeUserData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [tasks, analyzeUserData, refreshInterval]);

  return {
    // Datos
    insights,
    recommendations,
    isAnalyzing,
    lastUpdate,
    
    // Funciones
    analyzeUserData,
    executeRecommendation,
    dismissRecommendation,
    
    // Utilidades
    getPrimaryInsight,
    getPrimaryRecommendation,
    getPersonalizedGreeting,
    getAIStats,
    
    // Estados
    hasInsights: insights.length > 0,
    hasRecommendations: recommendations.length > 0,
    needsMoreData: insights.every(i => i.confidence < 0.3)
  };
};

export default useAI;