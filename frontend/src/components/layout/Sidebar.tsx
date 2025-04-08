import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, MessageSquare, Database, FileText, Activity, X, Edit, Check, LogOut, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import authService from '../../services/authService';
import { api, chatEndpoints, getCachedChats } from '../../pages/chat/config';
import configModule from '../../pages/chat/config';
import { toast } from 'react-hot-toast';

interface DataSourceConfig {
  type: 'csv' | 'postgres' | 'mysql' | 'excel';
  name: string;
  details: CsvConfig | DbConfig;
}

interface CsvConfig {
  filename: string;
}

interface DbConfig {
  dbType: 'mysql' | 'postgres';
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// Chat item interface
interface ChatItem {
  id: number | string;
  title: string;
  dataSourceName: string;
  createdAt?: string;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  // User data state
  const [userData, setUserData] = useState<{username: string, email?: string} | null>(null);

  // Data source selection and configuration states
  const [showDataSourceSelection, setShowDataSourceSelection] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<'csv' | 'database' | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [configName, setConfigName] = useState('');
  const [dbConfig, setDbConfig] = useState<Partial<DbConfig>>({
    dbType: 'mysql',
    host: '',
    port: '',
    username: '',
    password: '',
    database: ''
  });
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);
  const [editingSource, setEditingSource] = useState<string | null>(null);

  // Recent chats state
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<number | string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data when component mounts
  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Fetch chats from API
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        
        // Use the cached API call instead of direct API call
        const { data } = await getCachedChats();
        
        // Transform API data to match UI format
        if (Array.isArray(data)) {
          console.log("Received chat data:", data);
          
          const chats = data.map((chat: any) => ({
            id: chat.id,
            title: chat.name || `Chat ${chat.id}`,
            dataSourceName: chat.config_type || 'Database', // Display config type or default
            createdAt: chat.created_at
          }));
          
          setRecentChats(chats);
        } else {
          console.warn("Received unexpected data format:", data);
          setRecentChats([]);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setRecentChats([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
  }, []);

  // Handle logout
  const handleLogout = (e: MouseEvent) => {
    e.stopPropagation();
    authService.logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.username) return '?';
    
    const username = userData.username.trim();
    if (!username) return '?';
    
    // Get first letter of username
    const firstLetter = username.charAt(0).toUpperCase();
    
    // If there's an email with a last name
    if (userData?.email) {
      const emailName = userData.email.split('@')[0];
      const nameParts = emailName.split(/[._-]/);
      if (nameParts.length > 1) {
        const lastLetter = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        return `${firstLetter}${lastLetter}`;
      }
    }
    
    return firstLetter;
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };
  
  // File upload handlers
  const handleFileUpload = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent sidebar toggle
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCsvFile(files[0]);
      setCsvFileName(files[0].name);
    }
  };

  // Handler for new chat button
  const handleNewChat = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
        // Navigate to the new chat
        navigate(`/chat/config`);
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create a new chat");
    }
  };

  // Handler for selecting data source type
  const handleDataSourceSelect = (type: 'csv' | 'database' | 'excel') => {
    setSelectedDataSource(type === 'excel' ? 'csv' : type);
  };

  // Handler for CSV form submission
  const handleCsvSubmit = () => {
    if (csvFile && configName) {
      const newDataSource: DataSourceConfig = {
        type: 'csv',
        name: configName,
        details: {
          filename: csvFileName
        }
      };
      setDataSources([...dataSources, newDataSource]);
      
      // Reset form
      setCsvFile(null);
      setCsvFileName('');
      setConfigName('');
      setSelectedDataSource(null);
      setShowDataSourceSelection(false);
      
      // In a real app, you would send the file to the backend here
      // and create a new chat with this data source
      
      // Navigate to chat with this data source
      window.location.href = `/chat?dataSource=${encodeURIComponent(configName)}`;
    }
  };

  // Handler for database form submission
  const handleDbSubmit = () => {
    if (configName && 
        dbConfig.dbType && 
        dbConfig.host && 
        dbConfig.port && 
        dbConfig.username && 
        dbConfig.password && 
        dbConfig.database) {
      
      const newDataSource: DataSourceConfig = {
        type: 'postgres',
        name: configName,
        details: dbConfig as DbConfig
      };
      
      setDataSources([...dataSources, newDataSource]);
      
      // Reset form
      setConfigName('');
      setDbConfig({
        dbType: 'mysql',
        host: '',
        port: '',
        username: '',
        password: '',
        database: ''
      });
      setSelectedDataSource(null);
      setShowDataSourceSelection(false);
      
      // Navigate to chat with this data source
      window.location.href = `/chat?dataSource=${encodeURIComponent(configName)}`;
    }
  };

  // Handle editing a data source
  const handleEditSource = (name: string) => {
    const source = dataSources.find(ds => ds.name === name);
    if (source) {
      setEditingSource(name);
      setConfigName(name);
      
      if (source.type === 'csv') {
        const details = source.details as CsvConfig;
        setCsvFileName(details.filename);
        setSelectedDataSource('csv');
      } else {
        // Handle database source
        const details = source.details as DbConfig;
        setDbConfig({
          dbType: details.dbType,
          host: details.host,
          port: details.port,
          username: details.username,
          password: details.password,
          database: details.database
        });
        setSelectedDataSource('database');
      }
    }
  };

  // Handle canceling edit or new data source
  const handleCancel = () => {
    setSelectedDataSource(null);
    setShowDataSourceSelection(false);
    setEditingSource(null);
    setConfigName('');
    setCsvFile(null);
    setCsvFileName('');
    setDbConfig({
      dbType: 'mysql',
      host: '',
      port: '',
      username: '',
      password: '',
      database: ''
    });
  };

  // Handler for deleting a chat
  const handleDeleteChat = async (chatId: number | string, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      
      await api.delete(`${chatEndpoints.deleteChat}/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset the cache after deletion
      configModule.resetCache();
      
      // Remove from state after successful deletion
      setRecentChats(recentChats.filter(chat => chat.id !== chatId));
      setShowDeleteConfirmation(null);
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
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
            onClick={handleNewChat}
          >
            <Plus size={collapsed ? 16 : 18} className="flex-shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </Button>
        </div>
      </div>
      
      {/* Middle Section - Flexible */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Data Source Selection Modal */}
        {!collapsed && showDataSourceSelection && !selectedDataSource && (
          <div className="p-4 relative z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-zinc-800/70 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white">Select Data Source</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={handleCancel}
                >
                  <X size={14} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 bg-zinc-900/70 hover:bg-zinc-700/70 border-zinc-700/50"
                  onClick={() => handleDataSourceSelect('csv')}
                >
                  <FileText size={24} className="mb-2 text-violet-400" />
                  <span>CSV File</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 bg-zinc-900/70 hover:bg-zinc-700/70 border-zinc-700/50"
                  onClick={() => handleDataSourceSelect('database')}
                >
                  <Database size={24} className="mb-2 text-indigo-400" />
                  <span>Database</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* CSV Upload Form */}
        {!collapsed && selectedDataSource === 'csv' && (
          <div className="p-4 relative z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-zinc-800/70 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white">
                  {editingSource ? 'Edit CSV Config' : 'Import CSV File'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={handleCancel}
                >
                  <X size={14} />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="config-name" className="text-xs text-zinc-400">Config Name</Label>
                  <Input 
                    id="config-name"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="E.g. Sales Data 2023"
                  />
                </div>
                
                <div>
                  <Label htmlFor="csv-file" className="text-xs text-zinc-400">CSV File</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="csv-file"
                      readOnly
                      value={csvFileName}
                      className="bg-zinc-900/70 border-zinc-700/50 text-white flex-1"
                      placeholder="Select a CSV file..."
                    />
                    <Button
                      variant="outline"
                      className="bg-zinc-900/70 hover:bg-zinc-700/70 border-zinc-700/50"
                      onClick={handleFileUpload}
                    >
                      Browse
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="ghost"
                    className="bg-zinc-900/70 hover:bg-zinc-700/70"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600"
                    onClick={handleCsvSubmit}
                    disabled={!csvFileName || !configName}
                  >
                    {editingSource ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Database Config Form */}
        {!collapsed && selectedDataSource === 'database' && (
          <div className="p-4 relative z-10 pointer-events-auto overflow-y-auto max-h-[calc(100vh-250px)]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-zinc-800/70 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white">
                  {editingSource ? 'Edit Database Config' : 'Database Configuration'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={handleCancel}
                >
                  <X size={14} />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="db-config-name" className="text-xs text-zinc-400">Config Name</Label>
                  <Input 
                    id="db-config-name"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="E.g. Production DB"
                  />
                </div>
                
                <div>
                  <Label htmlFor="db-type" className="text-xs text-zinc-400">Database Type</Label>
                  <select
                    id="db-type"
                    value={dbConfig.dbType}
                    onChange={(e) => setDbConfig({...dbConfig, dbType: e.target.value as 'mysql' | 'postgres'})}
                    className="w-full rounded-md bg-zinc-900/70 border-zinc-700/50 text-white py-2 px-3"
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="db-host" className="text-xs text-zinc-400">Host</Label>
                  <Input 
                    id="db-host"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="localhost"
                  />
                </div>
                
                <div>
                  <Label htmlFor="db-port" className="text-xs text-zinc-400">Port</Label>
                  <Input 
                    id="db-port"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="3306"
                  />
                </div>
                
                <div>
                  <Label htmlFor="db-username" className="text-xs text-zinc-400">Username</Label>
                  <Input 
                    id="db-username"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig({...dbConfig, username: e.target.value})}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="root"
                  />
                </div>
                
                <div>
                  <Label htmlFor="db-password" className="text-xs text-zinc-400">Password</Label>
                  <Input 
                    id="db-password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <Label htmlFor="db-name" className="text-xs text-zinc-400">Database Name</Label>
                  <Input 
                    id="db-name"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    className="bg-zinc-900/70 border-zinc-700/50 text-white"
                    placeholder="mydatabase"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="ghost"
                    className="bg-zinc-900/70 hover:bg-zinc-700/70"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600"
                    onClick={handleDbSubmit}
                    disabled={!configName || !dbConfig.host || !dbConfig.port || !dbConfig.username || !dbConfig.password || !dbConfig.database}
                  >
                    {editingSource ? 'Update' : 'Connect'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Data Sources Section */}
        {!collapsed && dataSources.length > 0 && !showDataSourceSelection && !selectedDataSource && (
          <>
            <Separator className="bg-white/5" />
            
            <div className="flex-1 overflow-y-auto p-2 relative z-10">
              <div className="text-xs text-white/50 mb-2 px-2">
                Data Sources
              </div>
              <div className="space-y-1 mb-4">
                {dataSources.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-zinc-800/70 text-sm transition-colors pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to chat with this data source
                      window.location.href = `/chat?dataSource=${encodeURIComponent(source.name)}`;
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {source.type === 'csv' ? (
                        <FileText size={16} className="text-violet-400 shrink-0" />
                      ) : (
                        <Database size={16} className="text-indigo-400 shrink-0" />
                      )}
                      <span className="truncate text-zinc-200">{source.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSource(source.name);
                      }}
                    >
                      <Edit size={12} className="text-zinc-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Recent Chats - Only show when not collapsed and no forms are active */}
        {!collapsed && !showDataSourceSelection && !selectedDataSource && (
          <>
            <Separator className="bg-white/5" />
            
            <div className="flex-1 overflow-y-auto p-2 relative z-10">
              <div className="text-xs text-white/50 mb-2 px-2">
                Recent Chats
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="text-xs text-center py-2 text-zinc-500">Loading chats...</div>
                ) : recentChats.length > 0 ? (
                  recentChats.map((chat) => (
                    <div key={chat.id} className="relative">
                      <Link
                        to={`/chat/${chat.id}`}
                        className="flex flex-col gap-1 px-2 py-2 rounded-md hover:bg-zinc-800/70 text-sm transition-colors relative z-10 pointer-events-auto group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-primary-400 shrink-0" />
                          <span className="truncate text-zinc-200">{chat.title}</span>
                          
                          <div className="ml-auto flex items-center">
                            <button 
                              className="h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowDeleteConfirmation(chat.id);
                              }}
                            >
                              <Trash2 
                                size={14} 
                                className="text-red-500 hover:text-red-400 hover:scale-110 hover:rotate-12 transition-all duration-200" 
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-zinc-500 pl-6">
                          {chat.dataSourceName}
                        </div>
                      </Link>
                      
                      {showDeleteConfirmation === chat.id && (
                        <div 
                          className="absolute top-0 left-0 right-0 bottom-0 bg-zinc-900/90 rounded-md p-2 flex flex-col items-center justify-center z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-xs text-white mb-2">Delete this chat?</p>
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-xs py-0 h-7"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-xs py-0 h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowDeleteConfirmation(null);
                              }}
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-center py-2 text-zinc-500">No chats found</div>
                )}
              </div>
            </div>
          </>
        )}
        
        {collapsed && (
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
          <div className="flex flex-col w-full gap-2">
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
                <AvatarFallback className="font-bold text-white text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate text-zinc-200">
                    {userData?.username || 'User'}
                  </span>
                  <span className="text-xs text-white/60 truncate">
                    {userData?.email || ''}
                  </span>
                </div>
              )}
            </Link>

            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/70"
                onClick={handleLogout}
              >
                <LogOut size={14} className="flex-shrink-0" />
                <span>Logout</span>
              </Button>
            )}

            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-zinc-800/70"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={14} className="text-zinc-400 hover:text-white" />
              </Button>
            )}
          </div>
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