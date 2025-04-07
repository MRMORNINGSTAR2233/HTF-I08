import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, FileUp, ChartBar, ChevronLeft, MoreVertical, Download, Mic, MicOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  visualization?: {
    type: string;
    imageUrl: string;
  };
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'How do I create a visualization for my sales data across different regions?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      content: 'I can help you visualize your regional sales data. What specific aspects would you like to highlight in your visualization? For example, are you interested in comparing total sales, growth rates, or product-specific performance across regions?',
      sender: 'bot',
      timestamp: new Date(Date.now() - 1000 * 60 * 29),
    },
    {
      id: '3',
      content: 'I want to compare total sales across regions and also show the quarterly trend for each region.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: '4',
      content: 'I\'ve created a visualization that combines a bar chart for total regional sales comparison with line charts showing quarterly trends for each region. The visualization allows you to see both the overall comparison and temporal patterns simultaneously.',
      sender: 'bot',
      timestamp: new Date(Date.now() - 1000 * 60 * 24),
      visualization: {
        type: 'combination chart',
        imageUrl: 'https://via.placeholder.com/800x400',
      },
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('Sales Dashboard');
  const [isListening, setIsListening] = useState(false);
  const [placeholder, setPlaceholder] = useState('Click the microphone to speak...');
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
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

        setInputMessage(transcript);
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
        setInputMessage("");
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

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Stop listening after sending
    if (isListening) {
      toggleListening();
    }
    
    // Simulate bot response (would be replaced with actual API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m analyzing your request. Let me generate a visualization for you...',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-blue-500 via-indigo-400 to-transparent rounded-full opacity-15 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/3 right-1/4 w-48 h-48 bg-gradient-to-tr from-fuchsia-500 via-purple-400 to-transparent rounded-full opacity-10 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '3.5s' }}></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 p-3 backdrop-blur-sm bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full md:hidden">
            <ChevronLeft size={16} />
          </Button>
          <h1 className="text-lg font-medium">{title}</h1>
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
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 rounded-md bg-primary-600">
                  <AvatarFallback className="font-bold text-white">AI</AvatarFallback>
                </Avatar>
              )}
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-600 to-indigo-600">
                  <AvatarFallback className="font-bold text-white">AK</AvatarFallback>
                </Avatar>
              )}
              
              <div className="space-y-2">
                <div 
                  className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'bg-zinc-800/90 backdrop-blur-sm text-white border border-white/5'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                
                {message.visualization && (
                  <div className="p-2 rounded-lg bg-zinc-800/80 backdrop-blur-sm border border-white/5">
                    <div className="text-xs text-white/60 mb-2 flex items-center gap-1">
                      <ChartBar size={12} />
                      <span>{message.visualization.type}</span>
                    </div>
                    <img 
                      src={message.visualization.imageUrl} 
                      alt="Visualization" 
                      className="rounded w-full max-h-80 object-contain"
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Download size={12} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-white/40">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
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
                value={inputMessage}
                onClick={handleSearchFieldClick}
                readOnly
                placeholder={placeholder}
                className="flex-1 bg-transparent border-0 py-3 px-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 cursor-default"
              />
              
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
                <div className={`absolute inset-0 rounded-full ${inputMessage.trim() !== '' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 opacity-70' : 'bg-transparent'} blur-md transition-all duration-300`}></div>
                <Button 
                  variant="primary" 
                  size="icon" 
                  className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                    inputMessage.trim() !== '' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'bg-zinc-800 text-purple-400 hover:bg-zinc-700'
                  } transition-all duration-300`}
                  onClick={handleSendMessage}
                  disabled={inputMessage.trim() === ''}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Listening indicator */}
          {isListening && (
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
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
    </div>
  );
} 