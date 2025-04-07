import { useState, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, MessageSquare, FileUp, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [recentChats, setRecentChats] = useState([
    { id: '1', title: 'Data Visualization Project' },
    { id: '2', title: 'Marketing Analytics' },
    { id: '3', title: 'Sales Dashboard' }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };
  
  const handleFileUpload = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent sidebar toggle
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative flex flex-col h-screen bg-gradient-to-b from-[#121212] to-[#0f0f0f] border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[260px]'
      }`}
      onClick={handleToggle}
    >
      {/* Absolute overlay for improved click behavior - invisible */}
      <div className="absolute inset-0 z-0 cursor-pointer" />
      
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo and Toggle Button */}
        <div className={cn(
          "flex items-center relative z-10 px-4 py-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div
            className="pointer-events-auto flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/20 flex-shrink-0">
              <Activity size={16} className="text-white" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                Auralytics
              </span>
            )}
          </div>
          
          {!collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full relative z-10 pointer-events-auto hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              <ChevronLeft size={14} className="text-zinc-400 hover:text-white transition-colors" />
            </Button>
          )}
        </div>
        
        <Separator className="bg-white/5" />
        
        {/* File Upload Section */}
        <div className={cn(
          "p-4 relative z-10",
          collapsed && "flex justify-center"
        )}>
          <Button
            variant="outline"
            className={cn(
              "bg-zinc-800/70 hover:bg-zinc-700/80 border-zinc-700/30 text-white transition-all duration-200",
              collapsed ? "w-8 h-8 p-0 rounded-full" : "w-full justify-start gap-2"
            )}
            onClick={handleFileUpload}
          >
            <FileUp size={collapsed ? 16 : 18} className="flex-shrink-0" />
            {!collapsed && <span>Upload Files</span>}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => e.stopPropagation()}
          />
        </div>
        
        <Separator className="bg-white/5" />
        
        {/* New Chat Button */}
        <div className={cn(
          "p-4 relative z-10",
          collapsed && "flex justify-center"
        )}>
          <Button
            variant="primary"
            className={cn(
              "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-900/20 hover:shadow-lg hover:shadow-violet-900/30 border-none transition-all duration-200",
              collapsed ? "w-8 h-8 p-0 rounded-full" : "w-full justify-start gap-2"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Plus size={collapsed ? 16 : 18} className="flex-shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </Button>
        </div>
      </div>
      
      {/* Middle Section - Flexible */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Recent Chats - Only show when not collapsed */}
        {!collapsed ? (
          <>
            <Separator className="bg-white/5" />
            
            <div className="flex-1 overflow-y-auto p-2 relative z-10">
              <div className="text-xs text-white/50 mb-2 px-2">
                Recent Chats
              </div>
              <div className="space-y-1">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-zinc-800/70 text-sm transition-colors relative z-10 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare size={16} className="text-primary-400 shrink-0" />
                    <span className="truncate text-zinc-200">{chat.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Empty spacer in collapsed mode */}
            <div className="flex-1"></div>
          </>
        )}
      </div>
      
      {/* Bottom Section */}
      <div className="flex flex-col">
        <Separator className="bg-white/5" />
        
        {/* Profile Section */}
        <div className={cn(
          "p-4 relative z-10",
          collapsed && "flex justify-center"
        )}>
          <Link 
            to="/profile" 
            className={cn(
              "flex items-center gap-3 pointer-events-auto hover:bg-zinc-800/70 rounded-lg transition-colors",
              collapsed ? "justify-center px-1 py-1" : "px-2 py-1.5"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 shadow-md border border-purple-500/20">
              <AvatarImage src="" />
              <AvatarFallback className="font-bold text-white text-xs">AK</AvatarFallback>
            </Avatar>
            
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate text-zinc-200">Akshay Kumar</span>
                <span className="text-xs text-white/60 truncate">akshay@example.com</span>
              </div>
            )}
          </Link>
        </div>
        
        {/* Collapsed toggle button is now directly adjacent to the profile */}
        {collapsed && (
          <div className="p-3 flex justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full relative z-10 pointer-events-auto hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              <ChevronRight size={14} className="text-zinc-400 hover:text-white transition-colors" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 