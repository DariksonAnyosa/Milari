import { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onCommand, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Verificar soporte para Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      initializeSpeechRecognition();
    } else {
      console.warn('Speech Recognition no está soportado en este navegador');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuración optimizada para tu asistente
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES'; // Español
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('🎤 Escuchando...');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidence(confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processCommand(finalTranscript, confidence || 0.8);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento de voz:', event.error);
      setIsListening(false);
      
      // Reintentar en caso de ciertos errores
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (isListening) {
            startListening();
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Reconocimiento terminado');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const processCommand = (command, confidence) => {
    console.log(`Comando recibido: "${command}" (confianza: ${confidence})`);
    
    // Procesar el comando y enviarlo al componente padre
    const processedCommand = parseVoiceCommand(command);
    onCommand({
      raw: command,
      processed: processedCommand,
      confidence: confidence,
      timestamp: new Date()
    });
  };

  const parseVoiceCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    
    // Limpiar palabras de relleno comunes
    const cleanCmd = cmd
      .replace(/^(oye|hey|hola|mindflow|asistente),?\s*/i, '')
      .replace(/\s+(por favor|porfavor|gracias|ok|vale)$/i, '')
      .trim();
    
    console.log('Comando limpio:', cleanCmd);
    
    // Patrones mejorados de comandos
    const patterns = {
      // Agregar tareas - más variaciones
      add: /^(agregar|añadir|crear|nueva?\s*tarea|nuevo|recordar|agendar|apuntar|guardar|anotar)/i,
      
      // Consultas - más variaciones
      query: /^(qué|cuál|cuáles|mostrar|ver|listar|dime|muéstrame|cuéntame|tengo|hay)/i,
      
      // Completar tareas
      complete: /^(completar|terminar|marcar|finalizar|hecho|acabar|concluir)/i,
      
      // Eliminar
      delete: /^(eliminar|borrar|quitar|cancelar|remover)/i,
      
      // Saludos y conversación
      greeting: /^(hola|hey|buenas|buenos días|buenas tardes|buenas noches|qué tal|cómo estás)/i,
    };

    // Extraer información específica
    const result = {
      action: 'unknown',
      content: cleanCmd,
      rawContent: cmd,
      time: null,
      priority: 'normal',
      type: 'task',
      confidence: 0.8
    };

    // Determinar la acción
    for (const [action, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanCmd)) {
        result.action = action;
        result.confidence = 0.9;
        break;
      }
    }

    // Para comandos de agregar, extraer el contenido de la tarea
    if (result.action === 'add') {
      // Quitar la palabra de acción al inicio
      let taskContent = cleanCmd.replace(/^(agregar|añadir|crear|nueva?\s*tarea|nuevo|recordar|agendar|apuntar|guardar|anotar)\s*/i, '');
      
      // Manejar casos como "tarea de estudiar" -> "estudiar"
      taskContent = taskContent.replace(/^(tarea\s+de\s+|tarea\s+para\s+|tarea:\s*)/i, '');
      
      result.taskText = taskContent || cleanCmd;
      result.content = taskContent || cleanCmd;
    }

    // Para consultas, mejorar el contexto
    if (result.action === 'query') {
      if (/\b(hoy|esta\s+tarde|esta\s+noche|ahora)\b/i.test(cleanCmd)) {
        result.queryType = 'today';
      } else if (/\b(mañana|tomorrow)\b/i.test(cleanCmd)) {
        result.queryType = 'tomorrow';
      } else if (/\b(semana|week|esta\s+semana)\b/i.test(cleanCmd)) {
        result.queryType = 'week';
      } else if (/\b(pendiente|pendientes|sin\s+hacer|falta)\b/i.test(cleanCmd)) {
        result.queryType = 'pending';
      } else {
        result.queryType = 'all';
      }
    }

    // Extraer tiempo/fecha con más precisión
    const timePatterns = {
      today: /\b(hoy|esta\s+tarde|esta\s+noche|ahora|en\s+un\s+rato)\b/i,
      tomorrow: /\b(mañana|mañana\s+por\s+la\s+mañana|mañana\s+tarde)\b/i,
      thisWeek: /\b(esta\s+semana|esta\s+week)\b/i,
      nextWeek: /\b(próxima\s+semana|siguiente\s+semana|la\s+semana\s+que\s+viene)\b/i,
      time: /\b(\d{1,2}):?(\d{2})?\s*(am|pm|h|hora|horas|de\s+la\s+mañana|de\s+la\s+tarde|de\s+la\s+noche)?\b/i
    };

    for (const [timeType, pattern] of Object.entries(timePatterns)) {
      if (pattern.test(cleanCmd)) {
        result.time = timeType;
        result.confidence += 0.1;
        break;
      }
    }

    // Extraer prioridad con más variaciones
    if (/\b(urgente|importante|crítico|ya|rápido|ahora|asap|prioridad\s+alta)\b/i.test(cleanCmd)) {
      result.priority = 'high';
      result.confidence += 0.1;
    } else if (/\b(cuando\s+pueda|después|más\s+tarde|sin\s+prisa|prioridad\s+baja|no\s+urgente)\b/i.test(cleanCmd)) {
      result.priority = 'low';
    }

    // Detectar tipo de tarea
    if (/\b(reunión|meeting|junta|cita|llamada|call)\b/i.test(cleanCmd)) {
      result.type = 'meeting';
    } else if (/\b(recordar|reminder|aviso|avisar)\b/i.test(cleanCmd)) {
      result.type = 'reminder';
    } else if (/\b(estudiar|aprender|leer|revisar|practicar)\b/i.test(cleanCmd)) {
      result.type = 'study';
    } else if (/\b(comprar|shopping|tienda|mercado)\b/i.test(cleanCmd)) {
      result.type = 'shopping';
    }

    // Casos especiales para mejorar la confianza
    if (result.action === 'unknown') {
      // Si menciona palabras clave de tarea, probablemente quiere agregar
      if (/\b(hacer|completar|terminar|estudiar|trabajar|llamar|enviar|escribir|comprar)\b/i.test(cleanCmd)) {
        result.action = 'add';
        result.content = cleanCmd;
        result.taskText = cleanCmd;
        result.confidence = 0.7;
      }
      // Si hace una pregunta, probablemente es una consulta
      else if (/\?|qué|cuál|cuándo|dónde|cómo|tengo|hay/i.test(cleanCmd)) {
        result.action = 'query';
        result.confidence = 0.7;
      }
    }

    console.log('Resultado del parsing:', result);
    return result;
  };

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-input-container">
        <div className="voice-error">
          ❌ Tu navegador no soporta reconocimiento de voz
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      {/* Botón principal de voz */}
      <button 
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        disabled={!isSupported}
      >
        <div className="voice-icon">
          {isListening ? '🔴' : '🎤'}
        </div>
        <span className="voice-text">
          {isListening ? 'Escuchando...' : 'Hablar con MindFlow'}
        </span>
      </button>

      {/* Visualización del transcript */}
      {(transcript || isListening) && (
        <div className="voice-feedback">
          <div className="transcript-container">
            <div className="transcript-text">
              {transcript || (isListening ? 'Dí algo...' : '')}
              {isListening && <span className="cursor-blink">|</span>}
            </div>
            {confidence > 0 && (
              <div className="confidence-meter">
                <div className="confidence-label">Confianza:</div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="confidence-value">{Math.round(confidence * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comandos de ejemplo */}
      <div className="voice-examples">
        <div className="examples-title">Comandos que puedes usar:</div>
        <div className="examples-list">
          <span className="example">"Agregar estudiar React"</span>
          <span className="example">"Crear tarea llamar a María"</span>
          <span className="example">"¿Qué tengo hoy?"</span>
          <span className="example">"Completar tarea"</span>
          <span className="example">"Recordar comprar leche mañana"</span>
          <span className="example">"Hola, ¿cómo estoy?"</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;