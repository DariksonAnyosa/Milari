import { useState, useEffect, useRef } from 'react';
import { getDB } from '../../database/DatabaseManager';

const VoiceAssistant = ({ onClose, onTaskAdded }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const db = getDB();

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setLastResult({
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
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          setTranscript(event.results[i][0].transcript);
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processVoiceCommand(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setIsListening(false);
      setLastResult({
        type: 'error',
        message: 'Error en el reconocimiento de voz'
      });
    };

    recognitionRef.current = recognition;
  };

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    const parsed = parseCommand(command);
    
    try {
      if (parsed.action === 'add') {
        const taskData = {
          text: parsed.content,
          priority: parsed.priority,
          scheduled_time: parsed.time ? getDateFromTime(parsed.time) : new Date().toISOString(),
          type: parsed.type
        };
        
        await db.addTask(taskData);
        setLastResult({
          type: 'success',
          message: `✅ Tarea agregada: "${parsed.content}"`
        });
        onTaskAdded(); // Recargar datos en la app principal
        
      } else if (parsed.action === 'query') {
        const result = await handleQuery(parsed);
        setLastResult({
          type: 'info',
          message: result
        });
        
      } else if (parsed.action === 'complete') {
        const result = await handleComplete(parsed);
        setLastResult({
          type: 'success',
          message: result
        });
        onTaskAdded(); // Recargar datos
        
      } else {
        setLastResult({
          type: 'warning',
          message: `🤔 No entendí "${command}". Prueba: "Agregar [tarea]" o "¿Qué tengo hoy?"`
        });
      }
    } catch (error) {
      setLastResult({
        type: 'error',
        message: 'Error procesando el comando'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    
    const result = {
      action: 'unknown',
      content: cmd,
      priority: 'normal',
      type: 'task',
      time: null
    };

    // Detectar acción
    if (/^(agregar|añadir|crear|nueva?\s*tarea|recordar)/i.test(cmd)) {
      result.action = 'add';
      result.content = cmd.replace(/^(agregar|añadir|crear|nueva?\s*tarea|recordar)\s*/i, '');
    } else if (/^(qué|cuál|mostrar|ver|tengo)/i.test(cmd)) {
      result.action = 'query';
    } else if (/^(completar|terminar|marcar|hecho)/i.test(cmd)) {
      result.action = 'complete';
    }

    // Detectar tiempo
    if (/\b(hoy|ahora)\b/i.test(cmd)) {
      result.time = 'today';
    } else if (/\bmañana\b/i.test(cmd)) {
      result.time = 'tomorrow';
    }

    // Detectar prioridad
    if (/\b(urgente|importante|crítico)\b/i.test(cmd)) {
      result.priority = 'high';
    }

    return result;
  };

  const handleQuery = async (parsed) => {
    console.log('Procesando consulta:', parsed);
    
    if (parsed.content.includes('hoy')) {
      // Obtener tareas de HOY específicamente
      const today = new Date().toISOString().split('T')[0];
      const allTasks = await db.getTasks();
      
      console.log('Todas las tareas:', allTasks);
      
      const todayTasks = allTasks.filter(task => {
        const taskDate = task.scheduled_time ? 
          new Date(task.scheduled_time).toISOString().split('T')[0] : 
          new Date(task.created_at).toISOString().split('T')[0];
        console.log('Comparando:', taskDate, 'con', today);
        return taskDate === today;
      });
      
      console.log('Tareas de hoy encontradas:', todayTasks);
      
      const pending = todayTasks.filter(t => t.status === 'pending');
      const completed = todayTasks.filter(t => t.status === 'completed');
      
      if (pending.length === 0 && completed.length === 0) {
        return '📅 No tienes tareas programadas para hoy';
      }
      
      let message = `📅 Hoy tienes ${pending.length} tareas pendientes`;
      if (completed.length > 0) {
        message += ` y ${completed.length} completadas`;
      }
      
      if (pending.length > 0) {
        const taskList = pending.slice(0, 3).map(t => `"${t.text}"`).join(', ');
        message += `. Pendientes: ${taskList}`;
      }
      
      return message;
      
    } else if (parsed.content.includes('pendiente')) {
      const pendingTasks = await db.getTasks({ status: 'pending' });
      const taskList = pendingTasks.slice(0, 3).map(t => `"${t.text}"`).join(', ');
      return `📋 Tienes ${pendingTasks.length} tareas pendientes en total${pendingTasks.length > 0 ? `: ${taskList}` : ''}`;
      
    } else {
      const stats = await db.getTodayStats();
      return `📊 Resumen: ${stats.tasksToday} tareas hoy, ${stats.completed} completadas, ${stats.pending} pendientes`;
    }
  };

  const handleComplete = async (parsed) => {
    const pendingTasks = await db.getTasks({ status: 'pending' });
    if (pendingTasks.length > 0) {
      await db.completeTask(pendingTasks[0].id, '😊');
      return `✅ Completada: "${pendingTasks[0].text}"`;
    } else {
      return '❌ No hay tareas pendientes';
    }
  };

  const getDateFromTime = (timeType) => {
    const date = new Date();
    if (timeType === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    }
    return date.toISOString();
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setLastResult(null);
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
    <div className="voice-assistant">
      <div className="assistant-header">
        <h3 className="assistant-title">🎤 Asistente de Voz</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="assistant-content">
        {/* Botón principal */}
        <button 
          className={`voice-btn-compact ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          <div className="voice-icon">
            {isProcessing ? '⏳' : isListening ? '🔴' : '🎤'}
          </div>
          <span className="voice-text">
            {isProcessing 
              ? 'Procesando...' 
              : isListening 
                ? 'Escuchando...' 
                : 'Hablar'
            }
          </span>
        </button>

        {/* Transcript en tiempo real */}
        {(transcript || isListening) && (
          <div className="transcript-display">
            <div className="transcript-text">
              {transcript || 'Dí algo...'}
              {isListening && <span className="cursor-blink">|</span>}
            </div>
          </div>
        )}

        {/* Resultado del último comando */}
        {lastResult && (
          <div className={`result-display ${lastResult.type}`}>
            <div className="result-text">
              {lastResult.message}
            </div>
          </div>
        )}

        {/* Comandos de ejemplo */}
        <div className="quick-commands">
          <div className="commands-title">Comandos rápidos:</div>
          <div className="command-examples">
            <button 
              className="example-btn"
              onClick={() => processVoiceCommand('¿Qué tengo hoy?')}
            >
              "¿Qué tengo hoy?"
            </button>
            <button 
              className="example-btn"
              onClick={() => processVoiceCommand('Agregar estudiar React')}
            >
              "Agregar estudiar React"
            </button>
            <button 
              className="example-btn"
              onClick={() => processVoiceCommand('Completar tarea')}
            >
              "Completar tarea"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;