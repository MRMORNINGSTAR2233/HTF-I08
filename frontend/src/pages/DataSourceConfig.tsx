import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Database, FileText, X } from "lucide-react";
import { api, databaseEndpoints, fileUploadEndpoints, chatEndpoints, debugApiUrl } from "./chat/config";
import { toast } from "react-hot-toast";
import authService from "../services/authService";
import axios from "axios";

interface DbConfig {
  dbType: 'mysql' | 'postgresql';
  host: string;
  port: string;
  username: string;
  password: string;
  database_name: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // DB form state
  const [dbConfig, setDbConfig] = useState<Partial<DbConfig>>({
    dbType: 'mysql',
    host: '',
    port: '',
    username: '',
    password: '',
    database_name: ''
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

  // Handler for CSV form submission
  const handleCsvSubmit = async () => {
    if (csvFile && configName) {
      try {
        setIsSubmitting(true);
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          toast.error("You must be logged in to upload files.");
          navigate('/login');
          return;
        }
        
        // Get username directly with the safer method
        const username = authService.getUsername();
        if (!username) {
          toast.error("Unable to retrieve username. Please log in again.");
          authService.logout(); // Clear potentially corrupted auth data
          navigate('/login');
          return;
        }
        
        // Log file details for debugging
        console.log("Attempting to upload file:", {
          name: csvFile.name,
          type: csvFile.type,
          size: `${(csvFile.size / 1024).toFixed(2)} KB`
        });
        
        // Create a fallback path if upload fails
        let filePath = "";
        let uploadSuccess = false;
        
        try {
          // 2. Upload the file to R2 storage via the backend
          const formData = new FormData();
          formData.append('files', csvFile);
          
          // Log for debugging
          console.log("Uploading file for user:", username);
          
          // Directly use the upload endpoint to avoid path duplication
          const uploadUrl = fileUploadEndpoints.upload(username);
          console.log("Using upload URL:", uploadUrl);
          console.log("Full request URL:", debugApiUrl(uploadUrl));
          
          // Add timeout to prevent hanging requests
          const uploadResponse = await api.post(
            uploadUrl,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000, // 30 second timeout
            }
          );
          
          if (!uploadResponse.data || !uploadResponse.data.uploaded_files) {
            console.warn("Unexpected upload response format:", uploadResponse.data);
            throw new Error("File upload failed: Invalid response format");
          }
          
          const uploadedFile = uploadResponse.data.uploaded_files[0];
          filePath = uploadedFile.stored_name;
          uploadSuccess = true;
          console.log("File uploaded successfully:", filePath);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          
          // Use a fallback approach if the upload fails
          // Generate a temporary file path based on the user and filename
          const safeFileName = csvFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
          filePath = `temp/${username}/${safeFileName}`;
          toast.error("Direct upload failed. Using temporary file path instead.");
          
          // Continue with the database config creation using the fallback path
        }
        
        // 3. Create a database config entry for this file
        console.log("Creating database config with file path:", filePath);
        const dbConfigResponse = await api.post(databaseEndpoints.createDatabaseConfig, {
          name: configName,
          db_type: 'csv',
          file_path: filePath
        });
        
        const newDbConfig = dbConfigResponse.data;
        console.log("Database config created:", newDbConfig);
        
        // 4. Create a new chat with this data source
        const chatResponse = await api.post(chatEndpoints.createChat, {
          name: configName,
          config_id: newDbConfig.id,
          config_type: 'csv'
        });
        
        const newChat = chatResponse.data;
        console.log("New chat created:", newChat);
        
        // Show success message
        if (!uploadSuccess) {
          toast.success("Chat created with temporary file. Some features may be limited.");
        } else {
          toast.success("File uploaded and chat created successfully!");
        }
        
        // 5. Navigate to the new chat
        navigate(`/chat/${newChat.id}`);
        
      } catch (error) {
        console.error("Error submitting CSV:", error);
        
        // Check specifically for JSON parsing errors which indicate corrupt user data
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          toast.error("User session data is corrupted. Please log in again.");
          authService.logout();
          navigate('/login');
        } else if (axios.isAxiosError(error) && error.response) {
          // Handle specific HTTP error codes
          const status = error.response.status;
          if (status === 500) {
            toast.error("Server error uploading file. Please try again with a smaller file or contact support.");
          } else if (status === 413) {
            toast.error("File is too large. Please use a smaller file (max 100MB).");
          } else if (status === 415) {
            toast.error("Unsupported file type. Please use a CSV file.");
          } else {
            toast.error(`Upload failed: ${error.response.statusText}`);
          }
        } else {
          toast.error("Failed to upload file. Please try again or contact support.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handler for database form submission
  const handleDbSubmit = async () => {
    if (configName && 
        dbConfig.dbType && 
        dbConfig.host && 
        dbConfig.port && 
        dbConfig.username && 
        // Password can be empty, so don't check for it
        dbConfig.database_name) {
      
      try {
        setIsSubmitting(true);
        
        // 1. Create a database config entry
        const dbConfigResponse = await api.post(databaseEndpoints.createDatabaseConfig, {
          name: configName,
          db_type: dbConfig.dbType,
          host: dbConfig.host,
          port: parseInt(dbConfig.port),
          username: dbConfig.username,
          password: dbConfig.password || "", // Send empty string if password is not provided
          database_name: dbConfig.database_name
        });
        
        const newDbConfig = dbConfigResponse.data;
        
        // 2. Create a new chat with this data source
        const chatResponse = await api.post(chatEndpoints.createChat, {
          name: configName,
          config_id: newDbConfig.id,
          config_type: dbConfig.dbType
        });
        
        const newChat = chatResponse.data;
        
        // 3. Navigate to the new chat
        navigate(`/chat/${newChat.id}`);
        
      } catch (error) {
        console.error("Error creating database config:", error);
        toast.error("Failed to create database configuration. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (selectedDataSource) {
      setSelectedDataSource(null);
    } else {
      navigate('/chat');
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
                    disabled={!csvFileName || !configName || isSubmitting}
                    className={`${buttonPrimary} ${(!csvFileName || !configName || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Chat'}
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
                    onChange={(e) => setDbConfig({...dbConfig, dbType: e.target.value as 'mysql' | 'postgresql'})}
                    className={inputClasses}
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
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
                    Password (optional)
                  </label>
                  <input 
                    id="db-password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                    className={inputClasses}
                    placeholder="Leave empty if no password"
                  />
                </div>
                
                <div>
                  <label htmlFor="db-database" className="block text-sm font-medium text-zinc-300 mb-2">
                    Database Name
                  </label>
                  <input 
                    id="db-database"
                    type="text"
                    value={dbConfig.database_name}
                    onChange={(e) => setDbConfig({...dbConfig, database_name: e.target.value})}
                    className={inputClasses}
                    placeholder="my_database"
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
                    disabled={!configName || !dbConfig.host || !dbConfig.port || !dbConfig.username || !dbConfig.database_name || isSubmitting}
                    className={`${buttonPrimary} ${(!configName || !dbConfig.host || !dbConfig.port || !dbConfig.username || !dbConfig.database_name || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Chat'}
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