import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getDB } from '../../database/DatabaseManager';

const VoiceModal = ({ onClose, onTaskAdded, selectedDate, tasks, stats, darkMode }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const recognitionRef = useRef(null);
  const db = getDB();

  const parseVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Si el comando es muy corto, no es válido
    if (lowerCommand.length < 3) {
      return null;
    }

    // Palabras clave para fechas
    const timeKeywords = {
      'hoy': new Date(),
      'mañana': new Date(Date.now() + 24 * 60 * 60 * 1000),
      'pasado mañana': new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      'esta tarde': (() => {
        const today = new Date();
        today.setHours(15, 0, 0, 0);
        return today;
      })(),
      'esta noche': (() => {
        const today = new Date();
        today.setHours(20, 0, 0, 0);
        return today;
      })(),
      'mañana por la mañana': (() => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      })()
    };

    // Palabras clave para prioridad
    const priorityKeywords = {
      'urgente': 'urgent',
      'importante': 'high',
      'alta prioridad': 'high',
      'baja prioridad': 'low'
    };

    // Determinar tiempo programado
    let scheduledTime = selectedDate || new Date();
    for (const [keyword, time] of Object.entries(timeKeywords)) {
      if (lowerCommand.includes(keyword)) {
        scheduledTime = time;
        break;
      }
    }

    // Determinar prioridad
    let priority = 'normal';
    for (const [keyword, prio] of Object.entries(priorityKeywords)) {
      if (lowerCommand.includes(keyword)) {
        priority = prio;
        break;
      }
    }

    // Limpiar el texto de la tarea
    let taskText = command;
    
    // Remover palabras de tiempo comunes
    const removeWords = ['hoy', 'mañana', 'pasado mañana', 'esta tarde', 'esta noche', 'por la mañana', 'urgente', 'importante'];
    removeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      taskText = taskText.replace(regex, '');
    });

    // Limpiar espacios extra
    taskText = taskText.replace(/\s+/g, ' ').trim();

    return {
      text: taskText,
      scheduledTime: scheduledTime.toISOString(),
      priority: priority
    };
  };

  const processVoiceCommand = useCallback(async (command) => {
    setIsProcessing(true);
    setResponseMessage('Procesando...');
    
    try {
      // Analizar el comando de voz y extraer información
      const taskInfo = parseVoiceCommand(command);
      
      if (taskInfo) {
        // Crear la tarea
        const taskData = {
          text: taskInfo.text,
          title: taskInfo.text,
          scheduled_time: taskInfo.scheduledTime,
          priority: taskInfo.priority || 'normal',
          status: 'pending',
          type: 'task',
          created_at: new Date().toISOString()
        };

        await db.addTask(taskData);
        
        setResponseMessage(`Tarea creada: "${taskInfo.text}"`);
        
        if (onTaskAdded) {
          onTaskAdded();
        }
        
        // Auto-cerrar después de 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
        
      } else {
        setResponseMessage('No pude entender la tarea. Intenta ser más específico.');
      }
      
    } catch (error) {
      console.error('Error procesando comando:', error);
      setResponseMessage('Error al crear la tarea');
    } finally {
      setIsProcessing(false);
    }
  }, [db, onTaskAdded, onClose, selectedDate]);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponseMessage('Escuchando... Di tu tarea');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          setIsListening(false);
          processVoiceCommand(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
        setResponseMessage('Error al escuchar. Intenta de nuevo.');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (!transcript && !isProcessing) {
          setResponseMessage('Toca para hablar de nuevo');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setResponseMessage('Tu navegador no soporta reconocimiento de voz');
    }
  }, [transcript, isProcessing, processVoiceCommand]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  useEffect(() => {
    // Auto-iniciar grabación cuando se abre el modal
    startListening();
    
    // Cleanup al cerrar
    return () => {
      stopListening();
    };
  }, [startListening]);

  useEffect(() => {
    // Manejar tecla ESC para cerrar
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const modalContent = (
    <div className={`voice-modal-overlay ${darkMode ? 'dark' : 'light'}`} onClick={onClose}>
      <div className={`voice-modal-container ${darkMode ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="voice-modal-header">
          <div className="header-content">
            <div className="header-text">
              <h2>MILARI IA</h2>
              <p>Tu asistente personal inteligente</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Voice Visualization */}
        <div className="voice-visualization">
          <div className={`voice-orb ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}>
            <div className="orb-inner">
              <div className="orb-icon"></div>
            </div>
            {isListening && (
              <div className="sound-waves">
                <div className="wave wave-1"></div>
                <div className="wave wave-2"></div>
                <div className="wave wave-3"></div>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="voice-status">
          <p>{responseMessage}</p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="voice-transcript">
            <div className="transcript-header">
              <span>Escuché:</span>
            </div>
            <p className="transcript-text">"{transcript}"</p>
          </div>
        )}

        {/* Controls */}
        <div className="voice-controls">
          {isListening ? (
            <button className="voice-btn stop" onClick={stopListening}>
              Detener
            </button>
          ) : !isProcessing ? (
            <button className="voice-btn start" onClick={startListening}>
              Hablar
            </button>
          ) : null}
        </div>

        {/* Tips */}
        {!transcript && !isListening && !isProcessing && (
          <div className="voice-tips">
            <h4>Ejemplos de comandos:</h4>
            <ul>
              <li>"Comprar leche mañana"</li>
              <li>"Reunión con el equipo esta tarde"</li>
              <li>"Llamar al doctor urgente"</li>
              <li>"Hacer ejercicio por la mañana"</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default VoiceModal;