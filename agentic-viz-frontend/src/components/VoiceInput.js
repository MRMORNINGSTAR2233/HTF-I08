import React, { useState, useCallback, useEffect, useRef } from 'react';

const VoiceInput = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const timeoutRef = useRef(null);

  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Enable continuous listening
    recognition.interimResults = true; // Enable interim results
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Handle final transcript
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
      // Update interim transcript for visual feedback
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      switch (event.error) {
        case 'network':
          setError('Network error. Please check your internet connection.');
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        default:
          setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Only stop listening if we intended to stop
      if (isListening) {
        recognition.start(); // Restart if we didn't intend to stop
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    return recognition;
  }, [onTranscript, isListening]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize recognition once on mount
    const rec = initializeRecognition();
    if (rec) setRecognition(rec);
  }, [initializeRecognition]);

  const toggleListening = async () => {
    setError(null);
    
    if (isListening) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      recognition?.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      try {
        // Check microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up

        if (recognition) {
          recognition.start();
          setIsListening(true);
          
          // Set a timeout to stop recording after 30 seconds
          timeoutRef.current = setTimeout(() => {
            recognition.stop();
            setIsListening(false);
            setInterimTranscript('');
          }, 30000); // 30 seconds timeout
        }
      } catch (err) {
        setError('Microphone access denied. Please allow microphone access.');
      }
    }
  };

  return (
    <div className="voice-input">
      <button
        type="button"
        className={`voice-input-button ${isListening ? 'listening' : ''} ${error ? 'error' : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop recording' : 'Start recording'}
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path 
            fill="currentColor" 
            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
          />
        </svg>
      </button>
      {isListening && interimTranscript && (
        <div className="voice-input-interim">{interimTranscript}</div>
      )}
      {error && <div className="voice-input-error">{error}</div>}
    </div>
  );
};

export default VoiceInput;
