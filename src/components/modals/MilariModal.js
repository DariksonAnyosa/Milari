import { useState, useEffect, useRef } from 'react';
import { getDB } from '../../database/DatabaseManager';

const MilariModal = ({ onClose, onTaskAdded, selectedDate, tasks, stats, currentView }) => {
  const [activeMode, setActiveMode] = useState('voice'); // 'voice', 'manual', 'insights'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [milariResponse, setMilariResponse] = useState(null);
  const [confidence, setConfidence] = useState(0);
  
  // Estados para agregar tarea manual
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [priority, setPriority] = useState('normal');

  const recognitionRef = useRef(null);
  const db = getDB();

  useEffect(() => {
    initializeSpeechRecognition();
    initializeMilariContext();
    
    // Configurar fecha por defecto
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setTaskDate(formattedDate);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTaskDate(today);
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedDate]);

  const initializeMilariContext = async () => {
    // MILARI IA analiza el contexto al abrir
    const contextAnalysis = await analyzeCurrentContext();
    
    const welcomeMessage = generateWelcomeMessage(contextAnalysis);
    
    setMilariResponse({
      type: 'context',
      message: welcomeMessage,
      insights: contextAnalysis.insights,
      suggestions: contextAnalysis.suggestions,
      contextAnalysis: contextAnalysis
    });
    
    // Auto-cambiar a modo insights si hay datos importantes
    if (contextAnalysis.highPriorityCount > 0 || contextAnalysis.pendingCount > 3) {
      setActiveMode('insights');
    }
  };

  const analyzeCurrentContext = async () => {
    const now = new Date();
    const hour = now.getHours();
    const todayString = now.toISOString().split('T')[0];
    
    // Analizar tareas de hoy
    const todayTasks = tasks.filter(task => {
      const taskDate = task.scheduled_time ? 
        new Date(task.scheduled_time).toISOString().split('T')[0] : 
        new Date(task.created_at).toISOString().split('T')[0];
      return taskDate === todayString;
    });
    
    const pendingTasks = todayTasks.filter(t => t.status === 'pending');
    const completedTasks = todayTasks.filter(t => t.status === 'completed');
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
    
    // Análisis temporal
    let timeContext = '';
    if (hour >= 6 && hour < 12) {
      timeContext = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeContext = 'afternoon';
    } else {
      timeContext = 'evening';
    }
    
    // Generar insights inteligentes
    const insights = [];
    const suggestions = [];
    
    if (pendingTasks.length === 0 && completedTasks.length === 0) {
      insights.push('📅 No tienes tareas programadas para hoy');
      suggestions.push('Agregar algunas tareas para organizar tu día');
      suggestions.push('Revisar tareas pendientes de otros días');
    } else {
      if (pendingTasks.length > 0) {
        insights.push(`📋 Tienes ${pendingTasks.length} tareas pendientes para hoy`);
        if (highPriorityTasks.length > 0) {
          insights.push(`🔴 ${highPriorityTasks.length} son de alta prioridad`);
          suggestions.push(`Empezar con: "${highPriorityTasks[0].text}"`);
        }
      }
      
      if (completedTasks.length > 0) {
        const progressPercent = Math.round((completedTasks.length / todayTasks.length) * 100);
        insights.push(`✅ Ya completaste ${completedTasks.length} tareas (${progressPercent}%)`);
        
        if (progressPercent >= 80) {
          suggestions.push('¡Excelente progreso! Considera tomarte un descanso');
        } else if (progressPercent >= 50) {
          suggestions.push('Buen ritmo. Mantén el momentum');
        }
      }
    }
    
    // Sugerencias basadas en la hora
    if (timeContext === 'morning') {
      suggestions.push('Es buen momento para tareas complejas');
    } else if (timeContext === 'afternoon') {
      suggestions.push('Ideal para reuniones y tareas administrativas');
    } else {
      suggestions.push('Perfecto para planificar el día de mañana');
    }
    
    return {
      timeContext,
      pendingCount: pendingTasks.length,
      completedCount: completedTasks.length,
      highPriorityCount: highPriorityTasks.length,
      insights,
      suggestions,
      nextTask: pendingTasks[0] || null
    };
  };

  const generateWelcomeMessage = (context) => {
    const greetings = {
      morning: ['¡Buenos días!', '¡Hola! Comencemos el día', '¡Hora de ser productivo!'],
      afternoon: ['¡Buenas tardes!', '¡Hola! ¿Cómo va el día?', '¡Sigamos con energía!'],
      evening: ['¡Buenas noches!', '¡Hola! Tiempo de revisar el día', '¡Planifiquemos mañana!']
    };
    
    const greeting = greetings[context.timeContext][Math.floor(Math.random() * greetings[context.timeContext].length)];
    
    let message = `${greeting} Soy MILARI IA, tu asistente personal inteligente.\\n\\n`;
    
    if (context.pendingCount === 0 && context.completedCount === 0) {
      message += '✨ Tu agenda está despejada. ¿Qué te gustaría planificar?';
    } else if (context.pendingCount > 0) {
      message += `📋 Tienes ${context.pendingCount} tareas pendientes.`;
      if (context.nextTask) {
        message += ` La próxima es: "${context.nextTask.text}"`;
      }
    } else {
      message += `🎉 ¡Excelente! Has completado todas tus tareas (${context.completedCount}).`;
    }
    
    return message;
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMilariResponse({
        type: 'error',
        message: 'Tu navegador no soporta reconocimiento de voz'
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(Math.round(result[0].confidence * 100));
        } else {
          interimTranscript += result[0].transcript;
          setTranscript(interimTranscript);
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processMilariCommand(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setIsListening(false);
      setMilariResponse({
        type: 'error',
        message: 'Error en el reconocimiento de voz'
      });
    };

    recognitionRef.current = recognition;
  };

  const processMilariCommand = async (command) => {
    setIsProcessing(true);
    
    try {
      const cleanCommand = command.toLowerCase().trim();
      const response = await generateMilariResponse(cleanCommand);
      setMilariResponse(response);
      
      if (response.success) {
        onTaskAdded();
      }
      
    } catch (error) {
      setMilariResponse({
        type: 'error',
        message: 'Error procesando tu solicitud'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMilariResponse = async (command) => {
    // Detectar si es una pregunta o comando
    if (command.includes('qué') || command.includes('cómo') || command.includes('cuándo')) {
      return await handleMilariQuery(command);
    } else {
      return await handleMilariTask(command);
    }
  };

  const handleMilariQuery = async (query) => {
    const context = await analyzeCurrentContext();
    
    if (query.includes('tengo') && query.includes('hoy')) {
      if (context.pendingCount === 0) {
        return {
          type: 'info',
          message: '✅ No tienes tareas pendientes para hoy. ¡Perfecto momento para relajarte o planificar algo nuevo!',
          suggestions: ['Agregar nuevas tareas', 'Revisar mañana', 'Tomar un descanso']
        };
      } else {
        let message = `📋 Tienes ${context.pendingCount} tareas pendientes:\\n\\n`;
        const pendingTasks = tasks.filter(t => t.status === 'pending').slice(0, 3);
        pendingTasks.forEach((task, i) => {
          const priority = task.priority === 'urgent' ? ' 🔴' : task.priority === 'high' ? ' 🟠' : '';
          message += `${i + 1}. ${task.text}${priority}\\n`;
        });
        
        return {
          type: 'info',
          message,
          suggestions: [`Empezar con "${pendingTasks[0]?.text}"`, 'Ver todas las tareas', 'Agregar nueva tarea']
        };
      }
    } else if (query.includes('cómo') && query.includes('voy')) {
      const progressPercent = Math.round((context.completedCount / (context.completedCount + context.pendingCount)) * 100) || 0;
      return {
        type: 'success',
        message: `📊 Tu progreso hoy: ${progressPercent}%\\n\\n✅ Completadas: ${context.completedCount}\\n📋 Pendientes: ${context.pendingCount}`,
        suggestions: progressPercent >= 70 ? ['¡Excelente día!', 'Continuar así'] : ['Acelerar el ritmo', 'Priorizar tareas importantes']
      };
    } else {
      return {
        type: 'info',
        message: '🤔 No estoy seguro de cómo responder a eso. Puedo ayudarte con:\\n\\n• Ver tus tareas\\n• Agregar nuevas tareas\\n• Analizar tu progreso\\n• Darte sugerencias',
        suggestions: ['¿Qué tengo hoy?', 'Agregar tarea', '¿Cómo voy?']
      };
    }
  };

  const handleMilariTask = async (command) => {
    try {
      const taskData = {
        text: command,
        title: command,
        scheduled_time: new Date().toISOString(),
        priority: 'normal',
        status: 'pending',
        type: 'task',
        created_at: new Date().toISOString()
      };
      
      await db.addTask(taskData);
      
      return {
        type: 'success',
        success: true,
        message: `✅ Perfecto! Agregué la tarea: "${command}"`,
        suggestions: ['Agregar otra tarea', 'Ver mis tareas', 'Cerrar MILARI IA']
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Error creando la tarea'
      };
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      try {
        let scheduledDateTime = null;
        if (taskDate && taskTime) {
          scheduledDateTime = new Date(`${taskDate}T${taskTime}`);
        } else if (taskDate) {
          scheduledDateTime = new Date(`${taskDate}T09:00`);
        } else {
          scheduledDateTime = new Date();
        }

        const taskData = {
          text: taskTitle,
          title: taskTitle,
          scheduled_time: scheduledDateTime.toISOString(),
          priority: priority,
          status: 'pending',
          type: 'task',
          created_at: new Date().toISOString()
        };

        await db.addTask(taskData);
        
        setMilariResponse({
          type: 'success',
          message: `✅ Tarea "${taskTitle}" agregada exitosamente!`,
          suggestions: ['Agregar otra tarea', 'Ver mis tareas', 'Cerrar MILARI IA']
        });
        
        setTaskTitle('');
        setTaskTime('');
        setPriority('normal');
        
        onTaskAdded();
      } catch (error) {
        setMilariResponse({
          type: 'error',
          message: 'Error agregando la tarea'
        });
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setMilariResponse(null);
      setConfidence(0);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="milari-modal-overlay" onClick={onClose}>
      <div className="milari-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header MILARI IA */}
        <div className="milari-header">
          <div className="milari-avatar">
            🧠
          </div>
          <div className="milari-info">
            <h2>MILARI IA</h2>
            <p>Tu asistente personal inteligente</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modos de interacción */}
        <div className="interaction-modes">
          <button 
            className={`mode-btn ${activeMode === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveMode('voice')}
          >
            🎤 Hablar
          </button>
          <button 
            className={`mode-btn ${activeMode === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveMode('manual')}
          >
            ✍️ Escribir
          </button>
          <button 
            className={`mode-btn ${activeMode === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveMode('insights')}
          >
            🧠 Insights
          </button>
        </div>

        {/* Contenido dinámico */}
        <div className="milari-content">
          {activeMode === 'voice' && (
            <div className="voice-mode">
              <button 
                className={`milari-voice-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
              >
                <div className="voice-icon">
                  {isProcessing ? '🧠' : isListening ? '🔴' : '🎤'}
                </div>
                <span className="voice-text">
                  {isProcessing 
                    ? 'MILARI IA pensando...' 
                    : isListening 
                      ? 'Te escucho...' 
                      : 'Habla con MILARI IA'
                  }
                </span>
              </button>

              {(transcript || isListening) && (
                <div className="milari-transcript">
                  <div className="transcript-text">
                    {transcript || 'Dime lo que necesitas...'}
                    {isListening && <span className="cursor-blink">|</span>}
                  </div>
                  {confidence > 0 && (
                    <div className="confidence-indicator">
                      Confianza: {confidence}%
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMode === 'manual' && (
            <div className="manual-mode">
              <form onSubmit={handleManualSubmit}>
                <input 
                  type="text" 
                  className="task-input"
                  placeholder="¿Qué necesitas hacer?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                />
                
                <div className="form-row">
                  <div className="input-group">
                    <label>Fecha</label>
                    <input 
                      type="date" 
                      className="date-input"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Hora (opcional)</label>
                    <input 
                      type="time" 
                      className="time-input"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="priority-indicator-modal">
                  {['low', 'normal', 'high', 'urgent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`priority-chip ${p} ${priority === p ? 'selected' : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      {p === 'low' && '🟢 Baja'}
                      {p === 'normal' && '🟡 Normal'}
                      {p === 'high' && '🟠 Alta'}
                      {p === 'urgent' && '🔴 Urgente'}
                    </button>
                  ))}
                </div>

                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={!taskTitle.trim()}
                  style={{ marginTop: '20px' }}
                >
                  Agregar Tarea
                </button>
              </form>
            </div>
          )}

          {activeMode === 'insights' && (
            <div className="insights-mode">
              <h3>🧠 Análisis Inteligente</h3>
              <div className="insights-content">
                <div className="insight-section">
                  <h4>📊 Estado Actual</h4>
                  <div className="stats-grid">
                    <div className="stat-card pending">
                      <div className="stat-value">{stats.pending || 0}</div>
                      <div className="stat-label">Pendientes</div>
                    </div>
                    <div className="stat-card completed">
                      <div className="stat-value">{stats.completed || 0}</div>
                      <div className="stat-label">Completadas</div>
                    </div>
                    <div className="stat-card progress">
                      <div className="stat-value">{Math.round((stats.completed / (stats.completed + stats.pending)) * 100) || 0}%</div>
                      <div className="stat-label">Progreso</div>
                    </div>
                  </div>
                </div>
                
                {milariResponse?.contextAnalysis && (
                  <div className="insight-section">
                    <h4>💡 Insights Inteligentes</h4>
                    <div className="insights-list">
                      {milariResponse.contextAnalysis.insights.map((insight, index) => (
                        <div key={index} className="insight-item">
                          <span className="insight-text">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="insight-section">
                  <h4>🎯 Recomendaciones Smart</h4>
                  <div className="recommendations-list">
                    {milariResponse?.suggestions?.map((suggestion, index) => (
                      <button 
                        key={index} 
                        className="suggestion-btn"
                        onClick={() => {
                          if (suggestion.includes('Agregar')) {
                            setActiveMode('manual');
                          } else if (suggestion.includes('enfoque') || suggestion.includes('Pomodoro')) {
                            onClose();
                          }
                        }}
                      >
                        {suggestion}
                      </button>
                    )) || [
                      <button key="default1" className="suggestion-btn" onClick={() => setActiveMode('manual')}>
                        ➕ Agregar nueva tarea
                      </button>,
                      <button key="default2" className="suggestion-btn">
                        🔍 Revisar tareas pendientes
                      </button>
                    ]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Respuesta de MILARI IA */}
        {milariResponse && (
          <div className={`milari-response ${milariResponse.type}`}>
            <div className="response-message">
              {milariResponse.message}
            </div>
            {milariResponse.suggestions && (
              <div className="response-suggestions">
                <h4>💡 Sugerencias:</h4>
                {milariResponse.suggestions.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-btn"
                    onClick={() => {
                      if (suggestion.includes('Agregar')) {
                        setActiveMode('manual');
                      } else if (suggestion.includes('Ver')) {
                        setActiveMode('insights');
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilariModal;