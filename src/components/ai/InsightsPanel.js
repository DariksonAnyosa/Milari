// components/ai/InsightsPanel.js - Panel de insights de IA
import { useState } from 'react';
import useAI from '../../hooks/useAI';

const InsightsPanel = ({ tasks, compact = false }) => {
  const {
    insights,
    recommendations,
    isAnalyzing,
    getPrimaryInsight,
    getPrimaryRecommendation,
    executeRecommendation,
    dismissRecommendation,
    getAIStats,
    hasInsights,
    needsMoreData
  } = useAI(tasks);

  const [expandedInsight, setExpandedInsight] = useState(false);
  const [executingRec, setExecutingRec] = useState(null);

  const primaryInsight = getPrimaryInsight();
  const primaryRecommendation = getPrimaryRecommendation();
  const aiStats = getAIStats();

  const handleExecuteRecommendation = async (recommendation) => {
    setExecutingRec(recommendation);
    try {
      const result = await executeRecommendation(recommendation);
      console.log('Recomendación ejecutada:', result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setExecutingRec(null);
    }
  };

  // Versión compacta para HeroSection
  if (compact) {
    if (needsMoreData || !hasInsights) return null;
    
    return (
      <div className="insights-panel-compact">
        {primaryInsight && (
          <div className="insight-compact-card">
            <span className="insight-icon-compact">
              {getInsightIcon(primaryInsight.type)}
            </span>
            <div className="insight-text-compact">
              <span className="insight-title-compact">{primaryInsight.insight}</span>
            </div>
            <div className="insight-confidence-compact">
              {Math.round(primaryInsight.confidence * 100)}%
            </div>
          </div>
        )}
      </div>
    );
  }

  if (needsMoreData) {
    return (
      <div className="insights-panel needs-data">
        <div className="insights-header">
          <div className="insights-icon">🧠</div>
          <div className="insights-title">
            <h3>MILARI está aprendiendo sobre ti</h3>
            <p>Completa más tareas para generar insights personalizados</p>
          </div>
        </div>
        <div className="learning-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(tasks?.length * 10, 100)}%` }}
            ></div>
          </div>
          <p>Completa {Math.max(0, 10 - (tasks?.length || 0))} tareas más</p>
        </div>
      </div>
    );
  }

  if (!hasInsights && !isAnalyzing) {
    return null;
  }

  return (
    <div className="insights-panel">
      {/* Header con estado de IA */}
      <div className="insights-header">
        <div className="insights-icon">
          {isAnalyzing ? '🔄' : '🧠'}
        </div>
        <div className="insights-title">
          <h3>Insights Personalizados</h3>
          <p>
            {isAnalyzing 
              ? 'Analizando tus patrones...' 
              : `${aiStats.totalInsights} insights • Confianza ${aiStats.confidence}%`
            }
          </p>
        </div>
        {!expandedInsight && (
          <button 
            className="expand-btn"
            onClick={() => setExpandedInsight(true)}
          >
            Ver todo
          </button>
        )}
      </div>

      {/* Insight Principal */}
      {primaryInsight && (
        <div className="primary-insight">
          <div className="insight-content">
            <div className="insight-icon">
              {getInsightIcon(primaryInsight.type)}
            </div>
            <div className="insight-text">
              <h4>{primaryInsight.insight}</h4>
              <p>{getInsightDescription(primaryInsight)}</p>
            </div>
            <div className="insight-confidence">
              <div 
                className="confidence-bar"
                title={`Confianza: ${Math.round(primaryInsight.confidence * 100)}%`}
              >
                <div 
                  className="confidence-fill"
                  style={{ width: `${primaryInsight.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendación Principal */}
      {primaryRecommendation && (
        <div className={`primary-recommendation ${primaryRecommendation.priority}`}>
          <div className="recommendation-content">
            <div className="rec-header">
              <h4>{primaryRecommendation.title}</h4>
              <div className="rec-priority">
                {getPriorityIcon(primaryRecommendation.priority)}
              </div>
            </div>
            <p>{primaryRecommendation.message}</p>
            <div className="rec-actions">
              <button 
                className="btn-accept"
                onClick={() => handleExecuteRecommendation(primaryRecommendation)}
                disabled={executingRec === primaryRecommendation}
              >
                {executingRec === primaryRecommendation ? 'Ejecutando...' : 'Aceptar'}
              </button>
              <button 
                className="btn-dismiss"
                onClick={() => dismissRecommendation(primaryRecommendation)}
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista expandida */}
      {expandedInsight && (
        <div className="expanded-insights">
          <div className="expanded-header">
            <h4>Todos los Insights</h4>
            <button 
              className="collapse-btn"
              onClick={() => setExpandedInsight(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-icon-small">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="insight-details">
                  <h5>{insight.insight}</h5>
                  <p>{getInsightDescription(insight)}</p>
                  <div className="insight-meta">
                    <span className="confidence-badge">
                      {Math.round(insight.confidence * 100)}% confianza
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recommendations.length > 1 && (
            <div className="additional-recommendations">
              <h4>Otras Recomendaciones</h4>
              {recommendations.slice(1).map((rec, index) => (
                <div key={index} className={`rec-card ${rec.priority}`}>
                  <div className="rec-content">
                    <h5>{rec.title}</h5>
                    <p>{rec.message}</p>
                    <div className="rec-actions-small">
                      <button 
                        className="btn-accept-small"
                        onClick={() => handleExecuteRecommendation(rec)}
                        disabled={executingRec === rec}
                      >
                        {executingRec === rec ? '⏳' : '✓'}
                      </button>
                      <button 
                        className="btn-dismiss-small"
                        onClick={() => dismissRecommendation(rec)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Funciones auxiliares
const getInsightIcon = (type) => {
  const icons = {
    productive_hours: '⚡',
    productive_days: '📅',
    completion_streak: '🔥',
    weekly_trends: '📈',
    procrastination_patterns: '⏰'
  };
  return icons[type] || '📊';
};

const getPriorityIcon = (priority) => {
  const icons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };
  return icons[priority] || '🔵';
};

const getInsightDescription = (insight) => {
  switch (insight.type) {
    case 'productive_hours':
      return `Basado en ${insight.completions} tareas completadas en este horario`;
    case 'productive_days':
      return `${insight.completions} tareas completadas los ${insight.dayName}s`;
    case 'completion_streak':
      return `${insight.totalActiveDays} días activos en el último mes`;
    case 'weekly_trends':
      return `${insight.thisWeek} vs ${insight.lastWeek} tareas completadas`;
    case 'procrastination_patterns':
      return `${insight.delayedTasks} de ${insight.totalTasks} tareas retrasadas`;
    default:
      return 'Análisis basado en tu actividad reciente';
  }
};

export default InsightsPanel;