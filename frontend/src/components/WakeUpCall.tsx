import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface WakeUpCallProps {
  onWakeUpDetected: () => void;
}

const WakeUpCall: React.FC<WakeUpCallProps> = ({ onWakeUpDetected }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  // Start a new session
  const startSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: 'en-US' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (err) {
      setError('Failed to start speech recognition session');
      console.error(err);
      return null;
    }
  };

  // Process audio chunks
  const processAudioChunk = async (chunk: Blob) => {
    if (!sessionId) return;

    const formData = new FormData();
    formData.append('audio', chunk);

    try {
      const response = await fetch(`http://localhost:8000/api/process-audio/${sessionId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      // Check for results
      const resultsResponse = await fetch(`http://localhost:8000/api/get-results/${sessionId}`);
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        if (resultsData.results && resultsData.results.length > 0) {
          const latestResult = resultsData.results[resultsData.results.length - 1];
          setTranscript(latestResult.text);
          
          // Check if wake-up phrase is detected
          if (latestResult.text.toLowerCase().includes('aura, arise')) {
            stopRecording();
            onWakeUpDetected();
          }
        }
      }
    } catch (err) {
      console.error('Error processing audio:', err);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          processAudioChunk(e.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsListening(true);
      
      // Start a new session
      await startSession();
    } catch (err) {
      setError('Failed to access microphone');
      console.error(err);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      
      // Stop the session
      if (sessionId) {
        try {
          await fetch(`http://localhost:8000/api/stop-session/${sessionId}`, {
            method: 'POST',
          });
        } catch (err) {
          console.error('Error stopping session:', err);
        }
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopRecording();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-6">Wake Up Aura</h1>
        
        <div className="mb-8">
          <p className="text-lg mb-4">
            Say <span className="text-purple-400 font-bold">"Aura, Arise!"</span> to wake up Aura
          </p>
          
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <button
              onClick={isListening ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-full mb-4 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } transition-colors`}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            
            {isListening && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span>Listening...</span>
              </div>
            )}
          </div>
        </div>
        
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 p-4 rounded-lg max-w-md mx-auto"
          >
            <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
            <p>{transcript}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WakeUpCall; 