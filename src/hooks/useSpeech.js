// hooks/useSpeech.js - Optimizado para tu react-speech-recognition
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useSpeech = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => {
    SpeechRecognition.startListening({ 
      continuous: true, 
      language: 'es-ES' 
    });
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening: SpeechRecognition.stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
};