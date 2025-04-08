"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Search, PlusCircle, LayoutDashboard, MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useNavigate } from 'react-router-dom';
import { api, chatEndpoints } from './config';
import { toast } from 'react-hot-toast';
import axios from 'axios';

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

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        setSearchText(transcript);
        
        // Check if this is a final result
        if (event.results[0].isFinal) {
          console.log("Final transcript:", transcript);
          // Create a new chat with this transcript
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
        
        let response;
        
        // Try the primary endpoint first - users/chats
        try {
          console.log("Trying primary endpoint:", chatEndpoints.getUserChats);
          response = await api.get(chatEndpoints.getUserChats);
        } catch (primaryError) {
          console.warn('Primary chat endpoint failed, trying fallback 1:', primaryError);
          
          // First fallback: /user/chats
          try {
            console.log("Trying fallback 1:", chatEndpoints.userChatsAlt1);
            response = await api.get(chatEndpoints.userChatsAlt1);
          } catch (fallback1Error) {
            console.warn('First fallback failed, trying fallback 2:', fallback1Error);
            
            // Second fallback: POST to /chats/user
            try {
              console.log("Trying fallback 2:", chatEndpoints.userChatsAlt2);
              response = await api.post(chatEndpoints.userChatsAlt2);
            } catch (fallback2Error) {
              console.warn('Second fallback failed, trying final fallback:', fallback2Error);
              
              // Final fallback: GET /chats
              console.log("Trying final fallback:", chatEndpoints.getChats);
              response = await api.get(chatEndpoints.getChats);
            }
          }
        }
        
        console.log("Received chat data:", response?.data);
        
        // Transform the data to match our UI format
        if (response && response.data && Array.isArray(response.data)) {
          const chats = response.data.map((chat: any) => ({
            id: chat.id,
            title: chat.name || `Chat ${chat.id}`,
            dataSourceName: chat.config_type || 'Database', // More descriptive
            createdAt: chat.created_at ? new Date(chat.created_at).toISOString() : new Date().toISOString(),
          }));
          
          setRecentChats(chats);
        } else {
          console.warn("Received unexpected data format:", response?.data);
          setRecentChats([]);
        }
      } catch (error) {
        console.error("Error fetching chats after all attempts:", error);
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

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setSearchText("");
      }
      setIsListening(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle click on the search field to activate voice
  const handleSearchFieldClick = () => {
    if (!isListening) {
      toggleListening();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-white p-4">
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
            <div className="relative flex items-center rounded-2xl p-1 bg-black/40 backdrop-blur-sm focus-within:outline-none focus-within:ring-0 focus-within:shadow-none">
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
              <div className="relative p-1 mr-1 rounded-full">
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
        </div>
      </div>

      {/* Enhanced background effects */}
      <div className="fixed top-0 left-0 right-0 h-screen bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none" />
    </div>
  );
}