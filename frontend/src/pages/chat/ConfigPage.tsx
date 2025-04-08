import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ConfigPage: React.FC = () => {
  // Add a ref to store the speech synthesis instance
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to speak the welcome message
  const speakWelcomeMessage = () => {
    console.log('Attempting to speak welcome message...');
    
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      console.log('Cancelling ongoing speech');
      window.speechSynthesis.cancel();
    }

    // Create a new speech utterance
    const message = "Connect Your Data, Choose a data source to create a new visualization chat";
    console.log(`Creating utterance with message: "${message}"`);
    
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Try to use a female voice if available
    const voices = window.speechSynthesis.getVoices();
    console.log(`Available voices: ${voices.length}`);
    console.log('Voice names:', voices.map(v => v.name).join(', '));
    
    const femaleVoice = voices.find(voice => 
      voice.name.includes('female') || 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google US English Female')
    );
    
    if (femaleVoice) {
      console.log(`Using female voice: ${femaleVoice.name}`);
      utterance.voice = femaleVoice;
    } else {
      console.log('No female voice found, using default voice');
    }
    
    // Set speech properties
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Add event listeners for debugging
    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => console.log('Speech ended');
    utterance.onerror = (event) => console.error('Speech error:', event);
    utterance.onpause = () => console.log('Speech paused');
    utterance.onresume = () => console.log('Speech resumed');
    
    // Store the utterance in the ref
    speechSynthesisRef.current = utterance;
    
    // Speak the utterance
    console.log('Initiating speech synthesis...');
    window.speechSynthesis.speak(utterance);
  };

  // Use effect to speak the welcome message when the component mounts
  useEffect(() => {
    console.log('ConfigPage component mounted');
    
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Wait for voices to be loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      console.log('Voices not loaded yet, adding event listener');
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        console.log('Voices changed event fired');
        speakWelcomeMessage();
      });
    } else {
      console.log('Voices already loaded, speaking immediately');
      speakWelcomeMessage();
    }
    
    // Cleanup function to cancel speech when component unmounts
    return () => {
      console.log('ConfigPage component unmounting, cleaning up speech synthesis');
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      window.speechSynthesis.removeEventListener('voiceschanged', speakWelcomeMessage);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-3xl font-bold mb-6">Aura Configuration</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-lg mb-4">
            Welcome to Aura's configuration page. Here you can customize your experience with Aura.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Voice Settings</h2>
              <p className="mb-4">Configure Aura's voice and speech recognition settings.</p>
              <button 
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors"
                onClick={() => {
                  console.log('Voice settings button clicked');
                  speakWelcomeMessage();
                }}
              >
                Configure Voice
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Personality</h2>
              <p className="mb-4">Customize Aura's personality and response style.</p>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors">
                Configure Personality
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Knowledge Base</h2>
              <p className="mb-4">Manage Aura's knowledge sources and data connections.</p>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors">
                Configure Knowledge
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Appearance</h2>
              <p className="mb-4">Customize Aura's visual appearance and interface.</p>
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors">
                Configure Appearance
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition-colors"
              onClick={() => {
                console.log('Start chatting button clicked');
                speakWelcomeMessage();
              }}
            >
              Start Chatting with Aura
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfigPage; 