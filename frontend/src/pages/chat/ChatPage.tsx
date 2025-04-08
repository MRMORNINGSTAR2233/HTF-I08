"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Search, PlusCircle, LayoutDashboard, MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigate } from 'react-router-dom';
import { api, chatEndpoints, getCachedChats } from './config';
import configModule from './config';
import { toast } from 'react-hot-toast';
import axios from 'axios';
// Import the Aura component
import Aura from "../../components/effects/Aura";

// Declare SpeechRecognition type to avoid Typescript errors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Define ChatItem interface
interface ChatItem {
  id: number;
  title: string;
  dataSourceName: string;
  createdAt: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [placeholder, setPlaceholder] = useState(
    "Click the microphone to speak..."
  );
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Add state for showing Aura component
  const [showAura, setShowAura] = useState(false);
  // Add state for session ID
  const [sessionId, setSessionId] = useState<string | null>(null);
  // Add state for transcript
  const [transcript, setTranscript] = useState("");
  // Add refs for media recorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Add state for MIME type
  const [mimeType, setMimeType] = useState<string>('audio/webm;codecs=opus');

  // New function to create a chat
  const createNewChat = async () => {
    try {
      console.log("Creating new chat...");
      setIsLoading(true);
      
      const response = await api.post(chatEndpoints.createChat, {
        name: searchText.trim() ? `Chat about: ${searchText.trim().substring(0, 30)}...` : "New Chat",
        config_id: 1, // Default config ID
        config_type: "DATABASE" // Default type
      });
      
      // Reset the cache after creating a new chat
      configModule.resetCache();
      
      // Navigate to the new chat
      if (response.data && response.data.id) {
        console.log("Chat created successfully with ID:", response.data.id);
        toast.success("Chat created successfully");
        navigate(`/chat/${response.data.id}`);
      } else {
        console.error("Invalid response when creating chat:", response.data);
        toast.error("Failed to create a new chat: invalid response");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      
      // More descriptive error message
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Failed to create chat: ${error.response.status} ${error.response.statusText}`);
      } else {
        toast.error("Failed to create a new chat: network error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new session for AssemblyAI
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
      console.error('Failed to start speech recognition session:', err);
      return null;
    }
  };

  // Process audio chunks
  const processAudioChunk = async (chunk: Blob) => {
    if (!sessionId) return;
    
    const formData = new FormData();
    
    // Determine the file extension based on the MIME type
    let fileExtension = 'webm';
    if (mimeType.includes('ogg')) {
      fileExtension = 'ogg';
    } else if (mimeType.includes('mp4')) {
      fileExtension = 'mp4';
    }
    
    // Log the audio chunk info for debugging
    console.log(`Sending audio chunk: size=${chunk.size}, type=${chunk.type}, extension=${fileExtension}`);
    
    // The backend expects a file with the field name 'audio'
    formData.append('audio', chunk, `audio.${fileExtension}`);

    try {
      const response = await fetch(`http://localhost:8000/api/process-audio/${sessionId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from AssemblyAI:', errorData);
        console.error(`Error status: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to process audio: ${response.status} ${response.statusText}`);
      }

      const resultsResponse = await fetch(`http://localhost:8000/api/get-results/${sessionId}`);
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        if (resultsData.results && resultsData.results.length > 0) {
          const latestResult = resultsData.results[resultsData.results.length - 1];
          setTranscript(latestResult.text || '');
          
          // Remove wake-up phrase detection
        }
      }
    } catch (err) {
      console.error('Error processing audio with AssemblyAI:', err);
      
      // Don't display this error to the user - we'll rely on browser SpeechRecognition instead
      console.log('Using browser SpeechRecognition as fallback due to API errors');
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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        setSearchText(transcript);
        
        // Also update our transcript display to ensure we see what's being recognized
        setTranscript(transcript);
        
        // Check if this is a final result
        if (event.results[0].isFinal) {
          console.log("Final transcript from browser:", transcript);
          
          // Remove wake-up phrase detection, just create a new chat with transcript
          if (transcript.trim()) {
            createNewChat();
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [createNewChat]);

  useEffect(() => {
    // Fetch chats from the API
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        
        // Use the cached API call
        const { data } = await getCachedChats();
        
        console.log("Received chat data:", data);
        
        // Transform the data to match our UI format
        if (Array.isArray(data)) {
          const chats = data.map((chat: any) => ({
            id: chat.id,
            title: chat.name || `Chat ${chat.id}`,
            dataSourceName: chat.config_type || 'Database', // More descriptive
            createdAt: chat.created_at ? new Date(chat.created_at).toISOString() : new Date().toISOString(),
          }));
          
          setRecentChats(chats);
        } else {
          console.warn("Received unexpected data format:", data);
          setRecentChats([]);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to load chats");
        setRecentChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Add a handler to create new chat when user speaks or enters text
  const handleSearch = () => {
    if (searchText.trim()) {
      createNewChat();
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopRecording();
      setIsListening(false);
      setPlaceholder("Click the microphone to speak...");
    } else {
      // Start browser's speech recognition first
      let speechRecognitionStarted = false;
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          speechRecognitionStarted = true;
          setSearchText("");
          setPlaceholder("Speak to create a new chat...");
          console.log("Browser speech recognition started successfully");
        } catch (e) {
          console.error("Error starting speech recognition:", e);
          toast.error("Failed to start speech recognition");
        }
      }
      
      // Set listening state based on browser recognition success
      if (speechRecognitionStarted) {
        setIsListening(true);
      }
      
      // Try to start AssemblyAI recording in parallel - but don't block on success
      try {
        console.log("Attempting to start microphone for AssemblyAI...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Try to use the preferred MIME type, with fallbacks
        let mimeType = 'audio/webm;codecs=opus';
        let mediaRecorder;
        
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            audioBitsPerSecond: 128000
          });
        } catch (e) {
          console.warn('Preferred MIME type not supported, trying alternatives');
          // Try alternative MIME types
          const mimeTypes = [
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4'
          ];
          
          for (const type of mimeTypes) {
            try {
              mediaRecorder = new MediaRecorder(stream, {
                mimeType: type,
                audioBitsPerSecond: 128000
              });
              mimeType = type;
              console.log(`Using MIME type: ${type}`);
              break;
            } catch (e) {
              console.warn(`MIME type ${type} not supported`);
            }
          }
          
          // If all MIME types fail, use the default
          if (!mediaRecorder) {
            console.warn('Using default MediaRecorder configuration');
            mediaRecorder = new MediaRecorder(stream);
          }
        }
        
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
        console.error('Failed to access microphone for AssemblyAI:', err);
        
        // Don't show error toast if browser recognition is working
        if (!speechRecognitionStarted) {
          toast.error('Failed to access microphone. Make sure permissions are granted.');
          // We couldn't start either method, so don't set listening to true
          return;
        }
        // If browser recognition is working, just log the error
        console.log('Continuing with browser SpeechRecognition only');
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle click on the search field to focus
  const handleSearchFieldClick = () => {
    // Direct approach: show Aura when clicking the search field
    setShowAura(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-white p-4">
      {showAura ? (
        <Aura />
      ) : (
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            What do you want to visualize?
          </h1>
          <p className="text-xl mb-12 text-gray-400">
            Bring data to life with your{" "}
            <span className="text-gradient-purple">voice</span>. Ask,{" "}
            <span className="text-gradient-purple">visualize</span>, and discover.
          </p>

          <div className="relative w-full">
            {/* Modern Search Container with Shining Effect */}
            <div className="relative w-full rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 p-[2px] shadow-xl shadow-purple-900/20 group transition-all duration-300 hover:shadow-purple-800/30 focus-within:!outline-none focus-within:!ring-0 focus-within:!ring-offset-0">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 via-violet-400/20 to-blue-500/20 opacity-50 blur-sm transition-opacity group-hover:opacity-100 group-hover:blur-md"></div>
              
              {/* Shining light effect - top left corner */}
              <div className="absolute -top-5 -left-5 w-32 h-32 bg-gradient-to-br from-purple-500 via-violet-400 to-transparent rounded-full opacity-50 blur-2xl animate-pulse"></div>
              
              {/* Shining light effect - bottom right corner */}
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-gradient-to-tl from-blue-500 via-indigo-400 to-transparent rounded-full opacity-30 blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Search input container */}
              <div className="flex items-center h-full bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-2">
                <div className="flex h-full items-center justify-center px-4">
                  <Search className="h-5 w-5 text-purple-400" />
                </div>

                <Input
                  ref={inputRef}
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={placeholder}
                  readOnly
                  onClick={handleSearchFieldClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchText.trim()) {
                      handleSearch();
                    }
                  }}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="flex-1 bg-transparent border-0 py-6 px-2 text-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-transparent focus-visible:border-transparent cursor-default !outline-none !ring-0 !ring-offset-0"
                />
                
                {/* Voice button wrapper with glow effect */}
                <div className="relative p-1 ml-1 rounded-full">
                  <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse' : 'bg-transparent'} blur-md transition-all duration-300`}></div>
                  <Button
                    onClick={toggleListening}
                    variant="ghost"
                    size="icon"
                    className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center ${
                      isListening 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' 
                        : 'bg-zinc-800 text-purple-400 hover:bg-zinc-700'
                    } transition-all duration-300`}
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {isListening ? "Stop listening" : "Start listening"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Listening indicator */}
            {isListening && (
              <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
                <div className="flex items-center space-x-2 bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-500/20">
                  <span className="text-sm font-medium text-purple-400">Listening</span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Transcript display */}
            {transcript && (
              <div className="mt-20 bg-zinc-900/80 backdrop-blur-sm p-4 rounded-lg max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-2 text-purple-400">Transcript:</h2>
                <p className="text-white">{transcript}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced background effects */}
      <div className="fixed top-0 left-0 right-0 h-screen bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none" />
    </div>
  );
}