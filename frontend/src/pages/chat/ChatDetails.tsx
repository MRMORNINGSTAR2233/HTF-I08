import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, FileUp, ChartBar, ChevronLeft, MoreVertical, Download, Mic, MicOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { api, chatEndpoints } from './config';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Message interface (legacy for compatibility with UI components)

// Message interface to match backend schema
interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: {
    text?: string;
    thought?: string;
    query?: string | null;
    result?: any | null;
    data?: any[] | null;
  };
  timestamp: string;
  data?: any[]; // Optional data field
}

// Declare SpeechRecognition type to avoid Typescript errors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatDetails() {
  const { chatId } = useParams<{ chatId: string }>();
  const [title, setTitle] = useState(`Chat ${chatId}`);
  const [dataSource, setDataSource] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const placeholder = "Ask a question about your data...";
  const recognitionRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        console.log("Transcript detected:", transcript);
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        if (isListening) {
          recognitionRef.current.start();
          console.log("Restarted after end");
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setInput("");
      }
      setIsListening(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat data on component mount
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!chatId) return;
      
      try {
        setIsLoading(true);
        // Try to get the chat first
        const response = await api.get(chatEndpoints.getChat(parseInt(chatId)));
        
        // Set chat messages and title
        if (response.data) {
          // Set the title from the response
          setTitle(response.data.name || `Chat ${chatId}`);
          
          // Set data source details
          if (response.data.config_type) {
            setDataSource({
              type: 'database',
              name: response.data.config_type
            });
          }
          
          // Set chat messages
          if (response.data.conversation && Array.isArray(response.data.conversation)) {
            setMessages(response.data.conversation);
          } else {
            // Initialize with a welcome message if no messages
            setMessages([{
              role: 'system',
              content: {
                text: 'Welcome to your new chat! Ask me anything about your data.'
              },
              timestamp: new Date().toISOString()
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat details:', error);
        
        // Check if it's a 404 error (chat doesn't exist)
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 404) {
            // Create a new chat with default values
            try {
              console.log("Creating new chat with ID:", chatId);
              
              // Create a new chat
              const createResponse = await api.post(chatEndpoints.createChat, {
                name: `Chat ${chatId}`,
                config_id: 1, // Default config ID
                config_type: "DATABASE" // Default type
              });
              
              if (createResponse.data) {
                console.log("Chat created successfully:", createResponse.data);
                
                // Set chat data from response
                if (createResponse.data.conversation) {
                  setMessages(createResponse.data.conversation);
                } else {
                  // Initialize with a welcome message
                  setMessages([{
                    role: 'system',
                    content: {
                      text: 'Welcome to your new chat! Ask me anything about your data.'
                    },
                    timestamp: new Date().toISOString()
                  }]);
                }
                
                // Set the title from the response
                setTitle(createResponse.data.name || `Chat ${chatId}`);
              }
            } catch (createError) {
              console.error('Error creating new chat:', createError);
              toast.error('Failed to create a new chat');
              
              // Set default welcome message even on error
              setMessages([{
                role: 'system',
                content: {
                  text: 'Error loading chat. Please try again later.'
                },
                timestamp: new Date().toISOString()
              }]);
            }
          } else if (error.response.status === 500) {
            console.error('Server error when fetching chat:', error);
            toast.error('Server error. Please try again later.');
            
            // Set default error message for server error
            setMessages([{
              role: 'system',
              content: {
                text: 'Error loading chat. Please try again later.'
              },
              timestamp: new Date().toISOString()
            }]);
          } else {
            toast.error('Failed to load chat details');
            
            // Set default error message
            setMessages([{
              role: 'system',
              content: {
                text: 'Error loading chat. Please try again later.'
              },
              timestamp: new Date().toISOString()
            }]);
          }
        } else {
          toast.error('Failed to load chat details');
          
          // Set default error message
          setMessages([{
            role: 'system',
            content: {
              text: 'Error loading chat. Please try again later.'
            },
            timestamp: new Date().toISOString()
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatId) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: {
        text: input
      },
      timestamp: new Date().toISOString()
    };
    
    // Optimistically update UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    
    try {
      console.log("Sending message to chat ID:", chatId);
      
      // Try a different payload format - the backend might expect just the content string
      // or it might expect a different structure
      const payload = {
        content: input,
        // Add additional fields that might be required by the backend
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      console.log("Sending payload:", payload);
      
      // Send message to backend using POST with proper data structure
      const response = await api.post(
        chatEndpoints.addMessage(parseInt(chatId)), 
        payload
      );
      
      console.log("Message sent successfully, response:", response.data);
      
      // Create assistant message from response
      if (response.data) {
        // Log exact response structure for debugging
        console.log("Response thought:", response.data.thought);
        console.log("Response data:", response.data.data);
        
        // Create a content string from the response, handling different response formats
        let content = '';
        
        // Try to extract content from different possible response formats
        if (response.data.thought) {
          content = response.data.thought;
        } else if (response.data.message) {
          content = response.data.message;
        } else if (response.data.response) {
          content = response.data.response;
        } else if (response.data.content) {
          content = response.data.content;
        } else if (typeof response.data === 'string') {
          content = response.data;
        } else {
          // If no recognizable format, use a default message
          content = 'Received response from server.';
        }
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: {
            text: content,
            data: response.data.data || []
          },
          timestamp: new Date().toISOString()
        };
        
        console.log("Created assistant message:", assistantMessage);
        
        // Add assistant message to the conversation
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.warn("Message sent but no response data returned");
        toast.error("Message sent but no response received");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Try an alternative approach if first attempt fails with 500 error
      if (axios.isAxiosError(error) && error.response && error.response.status === 500) {
        try {
          console.log("First attempt failed with 500 error, trying alternative format");
          
          // Try with a simpler format as an alternative approach
          const altPayload = { message: input };
          console.log("Sending alternative payload:", altPayload);
          
          const altResponse = await api.post(
            chatEndpoints.addMessage(parseInt(chatId)), 
            altPayload
          );
          
          console.log("Alternative message sent successfully, response:", altResponse.data);
          
          // Process the response similar to the main approach
          if (altResponse.data) {
            let content = '';
            if (altResponse.data.thought) {
              content = altResponse.data.thought;
            } else if (altResponse.data.message) {
              content = altResponse.data.message;
            } else if (typeof altResponse.data === 'string') {
              content = altResponse.data;
            } else {
              content = 'Received response from server.';
            }
            
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: {
                text: content,
                data: altResponse.data.data || []
              },
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
          }
        } catch (altError) {
          console.error('Alternative message format also failed:', altError);
          toast.error('Server error. Please try again later.');
          
          // Remove the optimistically added message on error
          setMessages(prev => prev.filter(msg => 
            msg.content.text !== userMessage.content.text || 
            msg.timestamp !== userMessage.timestamp
          ));
        }
      } else if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          toast.error('Chat not found. Please create a new chat.');
        } else {
          toast.error(`Failed to send message: ${error.response.status} ${error.response.statusText}`);
        }
        
        // Remove the optimistically added message on error
        setMessages(prev => prev.filter(msg => 
          msg.content.text !== userMessage.content.text || 
          msg.timestamp !== userMessage.timestamp
        ));
      } else {
        toast.error('Failed to send message: network error');
        
        // Remove the optimistically added message on error
        setMessages(prev => prev.filter(msg => 
          msg.content.text !== userMessage.content.text || 
          msg.timestamp !== userMessage.timestamp
        ));
      }
    } finally {
      setIsSending(false);
    }
  };

  // Handle click on the search field to activate voice
  const handleSearchFieldClick = () => {
    if (!isListening) {
      toggleListening();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="fixed top-0 left-0 right-0 h-screen bg-gradient-to-b from-purple-900/30 via-indigo-900/20 to-transparent pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-indigo-900/20 via-violet-900/15 to-transparent pointer-events-none" />
      
      {/* Shining light effects */}
      <div className="fixed top-10 left-10 w-72 h-72 bg-gradient-to-br from-purple-500 via-violet-400 to-transparent rounded-full opacity-20 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-blue-500 via-indigo-700 to-transparent rounded-full opacity-10 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/3 right-1/4 w-48 h-48 bg-gradient-to-tr from-fuchsia-500 via-purple-800 to-transparent rounded-full opacity-10 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '3.5s' }}></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 p-3 backdrop-blur-sm bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full md:hidden">
            <ChevronLeft size={16} />
          </Button>
          <h1 className="text-lg font-medium">{title}</h1>
          {dataSource && (
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {dataSource.type === 'csv' ? 'CSV' : 'Database'}
              </span>
              <span>{dataSource.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Download size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical size={16} />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            {message.role !== 'user' && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/bot-avatar.png" alt="Bot" />
                <AvatarFallback className="bg-purple-900 text-white text-xs">AI</AvatarFallback>
              </Avatar>
            )}
            
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-zinc-800 border border-purple-900/30'
            }`}>
              <div className="mb-1">
                {(() => {
                  // Handle different content formats
                  if (typeof message.content === 'string') {
                    return message.content;
                  } else if (message.content?.text) {
                    return message.content.text;
                  } else if (message.content?.thought) {
                    return message.content.thought;
                  } else {
                    return JSON.stringify(message.content);
                  }
                })()}
              </div>
              
              {/* Conditional rendering for charts when data is available */}
              {(() => {
                // Get data from message.data or message.content.data
                const messageData = message.data || [];
                const contentData = (typeof message.content === 'object' && message.content?.data) ? message.content.data : [];
                const dataLength = messageData.length + (contentData?.length || 0);
                
                if (dataLength > 0) {
                  return (
                    <div className="mt-3 border-t border-purple-900/30 pt-3">
                      <div className="text-xs text-purple-300 mb-2">Data Visualization</div>
                      <div className="bg-black/30 p-2 rounded-md">
                        <div className="text-xs text-gray-400">
                          {dataLength} data points available for visualization
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                            <ChartBar size={12} />
                            View Chart
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="text-xs opacity-70 text-right mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 ml-2">
                <AvatarImage src="/user-avatar.png" alt="User" />
                <AvatarFallback className="bg-indigo-600 text-white text-xs">You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <Separator className="bg-white/5" />
      
      {/* Voice Input Area */}
      <div className="p-4 relative z-10 flex justify-center">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Modern Search Container with Shining Effect */}
          <div className="relative rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 p-[2px] shadow-xl shadow-purple-900/20 group transition-all duration-300 hover:shadow-purple-800/30 focus-within:!outline-none focus-within:!ring-0 focus-within:!ring-offset-0">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 via-violet-400/20 to-blue-500/20 opacity-50 blur-sm transition-opacity group-hover:opacity-100 group-hover:blur-md"></div>
            
            {/* Shining light effect */}
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500 via-violet-400 to-transparent rounded-full opacity-40 blur-2xl animate-pulse"></div>
            
            {/* Search input container */}
            <div className="relative flex items-center rounded-2xl p-1 bg-black/40 backdrop-blur-sm">
              <Button variant="ghost" size="icon" className="ml-1 text-purple-400">
                <FileUp size={18} />
              </Button>
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onClick={handleSearchFieldClick}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-0 py-3 px-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
              />
              
              {/* Listening indicator shown to the right of search bar */}
              {isListening && (
                <div className="flex items-center space-x-1 mr-2 bg-zinc-900/40 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-purple-400">Listening</span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Voice button with glow effect */}
              <div className="relative p-1 mr-1 rounded-full">
                <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse' : 'bg-transparent'} blur-md transition-all duration-300`}></div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleListening}
                  className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                    isListening 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' 
                      : 'bg-zinc-800 text-purple-400 hover:bg-zinc-700'
                  } transition-all duration-300`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
              </div>
              
              {/* Send button with glow effect */}
              <div className="relative p-1 mr-1 rounded-full">
                <div className={`absolute inset-0 rounded-full ${input.trim() !== '' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 opacity-70' : 'bg-transparent'} blur-md transition-all duration-300`}></div>
                <Button 
                  variant="primary" 
                  size="icon" 
                  className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                    input.trim() !== '' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'bg-zinc-800 text-purple-400 hover:bg-zinc-700'
                  } transition-all duration-300`}
                  onClick={handleSendMessage}
                  disabled={input.trim() === ''}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 