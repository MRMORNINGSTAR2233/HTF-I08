// API configuration for chat module
import axios from 'axios';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';

// Base URL for API - already includes /api/v1 from env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// For building paths, check if BASE_URL already includes /api/v1
const API_V1_STR = API_BASE_URL.includes('/api/v1') ? '' : '/api/v1';

// Common axios instance for all requests
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling for authentication issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error("API Error:", error);
    
    if (axios.isAxiosError(error)) {
      // Get the response if available
      const response = error.response;
      
      if (response) {
        // Handle authentication errors
        if (response.status === 401) {
          // Session expired or invalid token
          toast.error('Your session has expired. Please log in again.');
          authService.logout();
          
          // Redirect to login page
          window.location.href = '/login';
        } 
        // Handle forbidden errors
        else if (response.status === 403) {
          toast.error('You do not have permission to perform this action.');
        }
        // Handle server errors
        else if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        toast.error('Error preparing the request. Please try again.');
      }
    } else {
      // Handle non-Axios errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Utility function to debug API URLs
export const debugApiUrl = (path: string) => {
  // Remove any leading slash to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const fullUrl = `${API_BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
  return fullUrl;
};

// Database configuration endpoints
export const databaseEndpoints = {
  // Create a new database configuration
  createDatabaseConfig: `${API_V1_STR}/databases`,
  
  // Get a specific database configuration
  getDatabaseConfig: (id: number) => `${API_V1_STR}/databases/${id}`,
  
  // Get all database configurations for current user
  getDatabaseConfigs: `${API_V1_STR}/databases`,
  
  // Delete a database configuration
  deleteDatabaseConfig: (id: number) => `${API_V1_STR}/databases/${id}`,
  
  // Execute a query against a database
  executeQuery: (id: number) => `${API_V1_STR}/databases/${id}/query`,
};

// Chat endpoints
export const chatEndpoints = {
  // Create a new chat
  createChat: `${API_V1_STR}/chats`,
  
  // Get a specific chat
  getChat: (id: number) => `${API_V1_STR}/chats/${id}`,
  
  // Get all chats for current user
  getChats: `${API_V1_STR}/chats`,
  
  // Add a message to a chat
  addMessage: (id: number) => `${API_V1_STR}/chats/${id}/message`,
};

// File upload endpoints
export const fileUploadEndpoints = {
  // Upload files (CSV, Excel, etc.)
  upload: (username: string) => `${API_V1_STR}/upload/${username}`,
};

// Database preview endpoints
export const dataPreviewEndpoints = {
  // Get data preview from a database or file
  getPreview: (dbConfigId: number) => `${API_V1_STR}/preview/${dbConfigId}`,
};

// R2 storage configuration (used for file uploads)
export const r2Config = {
  bucketName: 'voi2viz',
  endpoint: 'https://716806fb9ea5f2938036b1e3f8f7767b.r2.cloudflarestorage.com',
};

// File upload helpers
export const fileUploadConfig = {
  maxFiles: 5,
  maxSize: 100 * 1024 * 1024, // 100MB 
  allowedExtensions: ['.csv', '.xlsx', '.xls'],
};

export default {
  api,
  databaseEndpoints,
  chatEndpoints,
  fileUploadEndpoints,
  dataPreviewEndpoints,
  r2Config,
  fileUploadConfig,
}; 