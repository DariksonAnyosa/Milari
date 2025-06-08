// components/ai/SmartGreeting.js - Saludo personalizado con IA
import useAI from '../../hooks/useAI';

const SmartGreeting = ({ tasks, selectedDate }) => {
  const {
    getPersonalizedGreeting,
    getPrimaryInsight,
    isAnalyzing,
    hasInsights
  } = useAI(tasks);

  const greeting = getPersonalizedGreeting();
  const primaryInsight = getPrimaryInsight();

  const getContextualMessage = () => {
    const hour = new Date().getHours();
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (!isToday) {
      const dayName = selectedDate.toLocaleDateString('es-ES', { weekday: 'long' });
      return `Planificando tu ${dayName}`;
    }

    if (isAnalyzing) {
      return 'Analizando tus patrones de productividad...';
    }

    if (!hasInsights) {
      return 'Tu asistente personal está aprendiendo sobre ti';
    }

    // Mensajes contextuales basados en insights
    if (primaryInsight) {
      switch (primaryInsight.type) {
        case 'productive_hours':
          if (hour >= primaryInsight.hour - 1 && hour <= primaryInsight.hour + 1) {
            return '¡Es tu momento más productivo del día!';
          }
          return `Tu mejor momento será a las ${primaryInsight.hour}:00`;
          
        case 'completion_streak':
          if (primaryInsight.currentStreak > 0) {
            return `Racha de ${primaryInsight.currentStreak} días • ¡Sigue así!`;
          }
          return '¡Hora de comenzar una nueva racha!';
          
        case 'weekly_trends':
          if (primaryInsight.improvement > 0) {
            return `Vas ${primaryInsight.improvement}% mejor que la semana pasada`;
          }
          return 'Enfócate en lo importante hoy';
          
        case 'productive_days':
          const today = new Date().getDay();
          if (today === primaryInsight.day) {
            return `¡Hoy es tu día más productivo!`;
          }
          return 'Aprovecha cada momento del día';
          
        default:
          return 'Tu asistente personal te acompaña hoy';
      }
    }

    // Mensajes por defecto basados en hora
    if (hour < 12) {
      return 'Empecemos el día con energía';
    } else if (hour < 18) {
      return 'Sigamos con el ritmo de la tarde';
    } else {
      return 'Cerremos el día con éxito';
    }
  };

  const getMotivationalQuote = () => {
    if (!primaryInsight) return null;

    const quotes = {
      productive_hours: [
        "El timing lo es todo. Aprovecha tu momento.",
        "Cuando estás en tu zona, todo fluye mejor."
      ],
      completion_streak: [
        "La consistencia es la madre del dominio.",
        "Un día a la vez, una tarea a la vez."
      ],
      weekly_trends: [
        "El progreso es progreso, sin importar qué tan lento.",
        "Cada semana es una nueva oportunidad de mejorar."
      ],
      productive_days: [
        "Hoy es tu día. Hazlo contar.",
        "Los grandes días comienzan con pequeñas acciones."
      ]
    };

    const typeQuotes = quotes[primaryInsight.type];
    if (typeQuotes) {
      return typeQuotes[Math.floor(Math.random() * typeQuotes.length)];
    }

    return null;
  };

  const contextualMessage = getContextualMessage();
  const motivationalQuote = getMotivationalQuote();

  return (
    <div className="smart-greeting">
      <div className="greeting-main">
        <h1 className="greeting-text">{greeting}</h1>
        <p className="greeting-context">{contextualMessage}</p>
      </div>

      {/* Indicador de estado IA */}
      <div className="ai-status">
        <div className={`ai-indicator ${isAnalyzing ? 'analyzing' : hasInsights ? 'active' : 'learning'}`}>
          <div className="ai-dot"></div>
          <span className="ai-label">
            {isAnalyzing ? 'Analizando' : hasInsights ? 'IA Activa' : 'Aprendiendo'}
          </span>
        </div>
      </div>

      {/* Quote motivacional */}
      {motivationalQuote && (
        <div className="motivational-quote">
          <div className="quote-icon">"</div>
          <p className="quote-text">{motivationalQuote}</p>
        </div>
      )}

      {/* Insight rápido */}
      {primaryInsight && !isAnalyzing && (
        <div className="quick-insight">
          <div className="insight-badge">
            <span className="insight-icon">
              {primaryInsight.type === 'productive_hours' && '⚡'}
              {primaryInsight.type === 'completion_streak' && '🔥'}
              {primaryInsight.type === 'weekly_trends' && '📈'}
              {primaryInsight.type === 'productive_days' && '⭐'}
              {primaryInsight.type === 'procrastination_patterns' && '⏰'}
            </span>
            <span className="insight-quick-text">
              {primaryInsight.insight}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartGreeting;