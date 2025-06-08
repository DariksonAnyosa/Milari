import { useState } from 'react';
import useAdaptiveMode from '../../hooks/useAdaptiveMode';

const AdaptiveModeSelector = ({ tasks, stats, compact = false }) => {
  const {
    currentMode,
    modeConfig,
    allModes,
    getPersonalizedGreeting,
    getModeInsights,
    getModeActions,
    setManualMode,
    resetToAutoMode
  } = useAdaptiveMode();

  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showFullInsights, setShowFullInsights] = useState(false);

  const insights = getModeInsights(currentMode, tasks, stats);
  const actions = getModeActions(currentMode);
  const greeting = getPersonalizedGreeting(currentMode);

  const handleModeChange = (newMode) => {
    setManualMode(newMode);
    setShowModeSelector(false);
  };

  // Versión compacta para el HeroSection
  if (compact) {
    return (
      <div className="adaptive-mode-compact-container">
        <div 
          className="mode-indicator-compact"
          style={{ '--mode-primary': modeConfig.primaryColor, '--mode-secondary': modeConfig.secondaryColor }}
          onClick={() => setShowFullInsights(!showFullInsights)}
        >
          <span className="mode-icon-compact">{modeConfig.icon}</span>
          <div className="mode-info-compact">
            <span className="mode-name-compact">{modeConfig.name}</span>
            <span className="mode-description-compact">{modeConfig.description}</span>
          </div>
          <button 
            className="mode-settings-compact"
            onClick={(e) => {
              e.stopPropagation();
              setShowModeSelector(!showModeSelector);
            }}
          >
            ⚙️
          </button>
        </div>

        {/* Selector de modo compacto */}
        {showModeSelector && (
          <div className="mode-selector-compact">
            {Object.entries(allModes).map(([key, mode]) => (
              <button
                key={key}
                className={`mode-option-compact ${currentMode === key ? 'active' : ''}`}
                onClick={() => handleModeChange(key)}
              >
                <span>{mode.icon}</span>
                <span>{mode.name}</span>
              </button>
            ))}
            <button 
              className="auto-mode-compact"
              onClick={() => {
                resetToAutoMode();
                setShowModeSelector(false);
              }}
            >
              🔄 Auto
            </button>
          </div>
        )}

        {/* Insight principal compacto */}
        {insights.length > 0 && (
          <div className="insight-compact">
            {insights[0]}
          </div>
        )}
      </div>
    );
  }

  // Versión completa para otras secciones

  return (
    <div className="adaptive-mode-container">
      {/* Header del modo actual */}
      <div 
        className="mode-header"
        style={{ '--mode-primary': modeConfig.primaryColor, '--mode-secondary': modeConfig.secondaryColor }}
      >
        <div className="mode-info">
          <div className="mode-icon-name">
            <span className="mode-icon">{modeConfig.icon}</span>
            <div className="mode-details">
              <h3 className="mode-name">{modeConfig.name}</h3>
              <p className="mode-description">{modeConfig.description}</p>
              <span className="mode-time">{modeConfig.timeRange}</span>
            </div>
          </div>
          
          <button 
            className="mode-selector-btn"
            onClick={() => setShowModeSelector(!showModeSelector)}
            title="Cambiar modo"
          >
            ⚙️
          </button>
        </div>

        {/* Saludo personalizado */}
        <div className="mode-greeting">
          {greeting}
        </div>
      </div>

      {/* Selector de modo desplegable */}
      {showModeSelector && (
        <div className="mode-selector-dropdown">
          <div className="mode-selector-header">
            <h4>Cambiar modo de interfaz</h4>
            <button 
              className="auto-mode-btn"
              onClick={() => {
                resetToAutoMode();
                setShowModeSelector(false);
              }}
            >
              🔄 Modo automático
            </button>
          </div>
          
          <div className="mode-options">
            {Object.entries(allModes).map(([key, mode]) => (
              <button
                key={key}
                className={`mode-option ${currentMode === key ? 'active' : ''}`}
                onClick={() => handleModeChange(key)}
              >
                <span className="option-icon">{mode.icon}</span>
                <div className="option-details">
                  <span className="option-name">{mode.name}</span>
                  <span className="option-time">{mode.timeRange}</span>
                  <span className="option-description">{mode.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Insights del modo actual */}
      {insights.length > 0 && (
        <div className="mode-insights">
          <h4 className="insights-title">💡 Insights para este momento</h4>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones recomendadas */}
      <div className="mode-actions">
        <h4 className="actions-title">🎯 Acciones recomendadas</h4>
        <div className="actions-list">
          {actions.map((action, index) => (
            <div key={index} className="action-item">
              <span className="action-bullet">•</span>
              {action}
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de progreso adaptativo */}
      <div className="adaptive-progress">
        <div className="progress-header">
          <span>Progreso del día</span>
          <span className="progress-value">
            {Math.round((stats.completed / (stats.completed + stats.pending)) * 100) || 0}%
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.round((stats.completed / (stats.completed + stats.pending)) * 100) || 0}%`,
              backgroundColor: modeConfig.primaryColor 
            }}
          ></div>
        </div>
        <div className="progress-details">
          <span>{stats.completed} completadas</span>
          <span>{stats.pending} pendientes</span>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveModeSelector;