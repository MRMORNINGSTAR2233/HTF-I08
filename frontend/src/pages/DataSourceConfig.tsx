import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Database, FileText, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface DbConfig {
  dbType: 'mysql' | 'postgres';
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export default function DataSourceConfig() {
  const navigate = useNavigate();
  
  // Selection state
  const [selectedDataSource, setSelectedDataSource] = useState<'csv' | 'database' | null>(null);
  
  // CSV form state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [configName, setConfigName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // DB form state
  const [dbConfig, setDbConfig] = useState<Partial<DbConfig>>({
    dbType: 'mysql',
    host: '',
    port: '',
    username: '',
    password: '',
    database: ''
  });

  // File upload handlers
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCsvFile(files[0]);
      setCsvFileName(files[0].name);
    }
  };

  // Handler for selecting data source type
  const handleDataSourceSelect = (type: 'csv' | 'database') => {
    setSelectedDataSource(type);
  };

  // Generate a random chat ID
  const generateChatId = () => {
    return Math.random().toString(36).substring(2, 6) + '-' +
           Math.random().toString(36).substring(2, 6) + '-' +
           Math.random().toString(36).substring(2, 4);
  };

  // Handler for CSV form submission
  const handleCsvSubmit = () => {
    if (csvFile && configName) {
      // Generate a unique chat ID
      const chatId = generateChatId();
      
      // Store config in localStorage (for demo purposes)
      const dataSource = {
        type: 'csv',
        name: configName,
        details: {
          filename: csvFileName
        }
      };
      
      // Save to local storage
      const dataSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      dataSources.push(dataSource);
      localStorage.setItem('dataSources', JSON.stringify(dataSources));
      
      // Create a new chat with this data source
      const newChat = {
        id: chatId,
        title: configName,
        dataSourceName: configName,
        createdAt: new Date().toISOString()
      };
      
      // Save to recent chats
      const recentChats = JSON.parse(localStorage.getItem('recentChats') || '[]');
      recentChats.unshift(newChat);
      localStorage.setItem('recentChats', JSON.stringify(recentChats));
      
      // Navigate to the specific chat details page
      navigate(`/chat/${chatId}`);
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
      
      // Generate a unique chat ID
      const chatId = generateChatId();
      
      // Store config in localStorage (for demo purposes)
      const dataSource = {
        type: 'database',
        name: configName,
        details: dbConfig
      };
      
      // Save to local storage
      const dataSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
      dataSources.push(dataSource);
      localStorage.setItem('dataSources', JSON.stringify(dataSources));
      
      // Create a new chat with this data source
      const newChat = {
        id: chatId,
        title: configName,
        dataSourceName: configName,
        createdAt: new Date().toISOString()
      };
      
      // Save to recent chats
      const recentChats = JSON.parse(localStorage.getItem('recentChats') || '[]');
      recentChats.unshift(newChat);
      localStorage.setItem('recentChats', JSON.stringify(recentChats));
      
      // Navigate to the specific chat details page
      navigate(`/chat/${chatId}`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (selectedDataSource) {
      setSelectedDataSource(null);
    } else {
      navigate('/');
    }
  };

  // Custom focus styles
  const inputClasses = "bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors";
  const buttonPrimary = "bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-medium py-3 px-6 rounded-md transition-all";
  const buttonSecondary = "bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-md transition-colors";

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Purple gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-black pointer-events-none" /> */}
      {/* <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div> */}
      
      <div className="relative z-10 w-full max-w-4xl mx-auto h-full overflow-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-violet-300 to-purple-400 mb-2">Connect Your Data</h1>
          <p className="text-zinc-400">
            Choose a data source to create a new visualization chat
          </p>
        </div>
        
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-purple-900/30 p-8 shadow-xl">
          {!selectedDataSource ? (
            /* Data Source Selection */
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Select Data Source Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => handleDataSourceSelect('csv')}
                  className="cursor-pointer flex flex-col items-center justify-center h-48 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 hover:from-purple-900/20 hover:to-zinc-800/80 border border-zinc-700/50 hover:border-purple-700/50 rounded-lg p-6 transition-all duration-300"
                >
                  <FileText size={40} className="text-purple-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">CSV File</h3>
                  <p className="text-zinc-400 text-sm text-center">
                    Upload and analyze data from CSV files
                  </p>
                </div>
                
                <div
                  onClick={() => handleDataSourceSelect('database')}
                  className="cursor-pointer flex flex-col items-center justify-center h-48 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 hover:from-purple-900/20 hover:to-zinc-800/80 border border-zinc-700/50 hover:border-purple-700/50 rounded-lg p-6 transition-all duration-300"
                >
                  <Database size={40} className="text-violet-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Database</h3>
                  <p className="text-zinc-400 text-sm text-center">
                    Connect to MySQL or PostgreSQL database
                  </p>
                </div>
              </div>
            </div>
          ) : selectedDataSource === 'csv' ? (
            /* CSV Configuration */
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-white">CSV File Configuration</h2>
                <button 
                  className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-purple-900/20 hover:text-white transition-colors"
                  onClick={handleCancel}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="config-name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Configuration Name
                  </label>
                  <input 
                    id="config-name"
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className={inputClasses}
                    placeholder="E.g. Sales Data 2023"
                  />
                </div>
                
                <div>
                  <label htmlFor="csv-file" className="block text-sm font-medium text-zinc-300 mb-2">
                    CSV File
                  </label>
                  <div className="flex gap-3">
                    <input 
                      id="csv-file"
                      type="text"
                      readOnly
                      value={csvFileName}
                      className={`${inputClasses} flex-1`}
                      placeholder="Select a CSV file..."
                    />
                    <button
                      onClick={handleFileUpload}
                      className={buttonSecondary}
                    >
                      Browse
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={handleCancel}
                    className={buttonSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCsvSubmit}
                    disabled={!csvFileName || !configName}
                    className={`${buttonPrimary} ${(!csvFileName || !configName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Create Chat
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Database Configuration */
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-white">Database Configuration</h2>
                <button 
                  className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-purple-900/20 hover:text-white transition-colors"
                  onClick={handleCancel}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-6 max-h-[calc(80vh-250px)] overflow-y-auto pr-4">
                <div>
                  <label htmlFor="db-config-name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Configuration Name
                  </label>
                  <input 
                    id="db-config-name"
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className={inputClasses}
                    placeholder="E.g. Production DB"
                  />
                </div>
                
                <div>
                  <label htmlFor="db-type" className="block text-sm font-medium text-zinc-300 mb-2">
                    Database Type
                  </label>
                  <select
                    id="db-type"
                    value={dbConfig.dbType}
                    onChange={(e) => setDbConfig({...dbConfig, dbType: e.target.value as 'mysql' | 'postgres'})}
                    className={inputClasses}
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="db-host" className="block text-sm font-medium text-zinc-300 mb-2">
                      Host
                    </label>
                    <input 
                      id="db-host"
                      type="text"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                      className={inputClasses}
                      placeholder="localhost"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="db-port" className="block text-sm font-medium text-zinc-300 mb-2">
                      Port
                    </label>
                    <input 
                      id="db-port"
                      type="text"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                      className={inputClasses}
                      placeholder="3306"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="db-username" className="block text-sm font-medium text-zinc-300 mb-2">
                    Username
                  </label>
                  <input 
                    id="db-username"
                    type="text"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig({...dbConfig, username: e.target.value})}
                    className={inputClasses}
                    placeholder="root"
                  />
                </div>
                
                <div>
                  <label htmlFor="db-password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Password
                  </label>
                  <input 
                    id="db-password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                    className={inputClasses}
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label htmlFor="db-name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Database Name
                  </label>
                  <input 
                    id="db-name"
                    type="text"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    className={inputClasses}
                    placeholder="mydatabase"
                  />
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={handleCancel}
                    className={buttonSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDbSubmit}
                    disabled={!configName || !dbConfig.host || !dbConfig.port || !dbConfig.username || !dbConfig.password || !dbConfig.database}
                    className={`${buttonPrimary} ${(!configName || !dbConfig.host || !dbConfig.port || !dbConfig.username || !dbConfig.password || !dbConfig.database) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Connect & Create Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 