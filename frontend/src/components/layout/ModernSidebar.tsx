"use client";

import * as React from "react";
import {
  User,
  Upload,
  MessageSquarePlus,
  MessageSquare,
  BarChart3,
  Mic,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Outlet } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

interface RecentChat {
  id: string | number;
  title: string;
  lastMessage: string;
  unread: boolean;
}

export function ModernSidebar() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <SidebarContents />
        <PageContent />
      </div>
    </SidebarProvider>
  );
}

function SidebarContents() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [recentChats, setRecentChats] = React.useState<RecentChat[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { collapsed, setCollapsed } = useSidebar();

  // Load recent chats from localStorage on component mount
  React.useEffect(() => {
    const storedRecentChats = localStorage.getItem('recentChats');
    if (storedRecentChats) {
      try {
        const parsedChats = JSON.parse(storedRecentChats);
        // Transform the data to match the expected format
        const formattedChats = parsedChats.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          lastMessage: chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'New',
          unread: false
        }));
        setRecentChats(formattedChats);
      } catch (e) {
        console.error('Error parsing stored recent chats:', e);
      }
    }
  }, []);

  const handleFileUpload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent sidebar toggle
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="relative h-full">
      {/* Invisible overlay for clickable collapse */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={toggleSidebar}
      />
      
      <Sidebar className="relative z-0 border-r border-zinc-800/60 bg-gradient-to-b from-[#121212] to-[#0f0f0f] shadow-xl h-full">
        <SidebarHeader className="py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Auralytics"
                className="flex justify-center items-center pointer-events-auto relative z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/20 text-white">
                  <BarChart3 className="size-5" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col ml-3 gap-0.5 leading-none">
                    <span className="font-semibold text-white">Auralytics</span>
                    <span className="text-zinc-400 text-sm">Enterprise</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="flex flex-col h-full">
          {/* File Upload Section */}
          <SidebarGroup className="mt-2 mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-zinc-400 px-2">
                Files
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className="flex justify-center items-center flex-col">
              <SidebarMenuButton
                tooltip="Upload File"
                className={`flex ${collapsed ? "justify-center" : "justify-start"} items-center bg-zinc-800/70 backdrop-blur-sm rounded-lg cursor-pointer gap-2 w-full border ${collapsed ? "p-2.5" : "px-3 py-2.5"} border-zinc-700/30 hover:bg-zinc-700/80 text-white hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-violet-900/10 pointer-events-auto relative z-20`}
                onClick={handleFileUpload}
              >
                <Upload className="size-5 text-zinc-300 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-zinc-200 truncate">Upload File</span>
                )}
              </SidebarMenuButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile && !collapsed && (
                <div className="mt-2 text-xs text-zinc-400 truncate px-1 w-full">
                  {selectedFile.name}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* New Chat Button */}
          <SidebarGroup className="mb-6">
            {!collapsed && (
              <SidebarGroupLabel className="text-zinc-400 px-2">
                Chat
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className="flex justify-center items-center">
              <SidebarMenuButton
                tooltip="New Chat"
                className={`flex ${collapsed ? "justify-center" : "justify-start"} items-center bg-gradient-to-r rounded-lg cursor-pointer gap-2 w-full ${collapsed ? "p-2.5" : "py-2.5 px-3"} from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:text-white shadow-md shadow-violet-900/20 hover:shadow-lg hover:shadow-violet-900/30 transition-all duration-200 pointer-events-auto relative z-20`}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/chat/config";
                }}
              >
                <MessageSquarePlus className="size-5 text-white flex-shrink-0" />
                {!collapsed && (
                  <span className="text-white font-medium truncate">New Chat</span>
                )}
              </SidebarMenuButton>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Recent Chats - Only shown when not collapsed */}
          {!collapsed && (
            <SidebarGroup className="mb-4">
              <SidebarGroupLabel className="text-zinc-400 px-2">
                Recent Chats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentChats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton 
                        tooltip={chat.title}
                        className="hover:bg-zinc-800/70 rounded-lg transition-all duration-200 px-2 py-1.5 pointer-events-auto relative z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center w-full">
                          <MessageSquare className="size-4.5 text-zinc-400 flex-shrink-0" />
                          <span className="ml-2 truncate text-zinc-200">{chat.title}</span>
                          <span className="text-xs text-zinc-500 ml-auto">
                            {chat.lastMessage}
                          </span>
                          {chat.unread && (
                            <Badge className="ml-2 h-2 w-2 rounded-full bg-violet-500 p-0 flex-shrink-0" />
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Spacer to push footer to bottom when content is short */}
          <div className="flex-grow"></div>
        </SidebarContent>

        <SidebarFooter className="py-4 border-t border-zinc-800/40">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Profile"
                className="hover:bg-zinc-800/70 rounded-lg transition-all duration-200 pointer-events-auto relative z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`flex items-center ${collapsed ? "justify-center" : ""}`}>
                  <Avatar className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 shadow-md shadow-violet-900/20 border border-purple-500/20 flex-shrink-0">
                    <AvatarFallback className="text-white font-medium text-sm">AK</AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col ml-3 gap-0.5 leading-none">
                      <span className="font-medium text-zinc-200">Akshay Kumar</span>
                      <span className="text-zinc-400 text-xs truncate">
                        akshay@example.com
                      </span>
                    </div>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Sidebar collapse indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-1">
          <div 
            className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-5 cursor-pointer items-center justify-center rounded-full border border-zinc-800/70 bg-[#121212] shadow-md hover:border-zinc-700 transition-all duration-200 hover:scale-110 pointer-events-auto z-20"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3 text-zinc-400 hover:text-white transition-all" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-zinc-400 hover:text-white transition-all" />
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
}

function PageContent() {
  return (
    <SidebarInset className="flex-1 border-zinc-800 bg-gradient-to-b from-[#121212] to-[#0c0c0c] text-white w-full h-full overflow-auto">
      <header className="sticky top-0 z-10 backdrop-blur-sm flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800/60 px-6 bg-[#111111]/90">
        <SidebarTrigger className="text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200 rounded-lg transition-all duration-200" />
        <Separator orientation="vertical" className="h-4 bg-zinc-800/80" />
        <h1 className="text-zinc-200 font-medium ml-2">Dashboard</h1>
      </header>
      <Outlet />
      
      {/* Chat Input Footer - Example of using the Input component */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0a0a0a] to-[#121212]/95 backdrop-blur-md border-t border-zinc-800/40">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button className="p-2.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 hover:text-white transition-all duration-200 shadow-sm">
            <Mic className="size-5" />
          </button>
          <Input 
            placeholder="Type your message..." 
            className="flex-1 bg-zinc-800/60 backdrop-blur-sm border-zinc-700/30 text-white placeholder:text-zinc-400 focus:border-violet-500 py-5 px-4 rounded-xl shadow-sm transition-all duration-200" 
          />
          <button className="p-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-md shadow-violet-900/20 hover:shadow-lg hover:shadow-violet-900/30">
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </SidebarInset>
  );
} 