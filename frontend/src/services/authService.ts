import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authService = {
  async login(username: string, password: string) {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');

      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      if (response.data.token || response.data.access_token) {
        const token = response.data.token || response.data.access_token;
        localStorage.setItem('token', token);
        
        // Ensure we have user data to store
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // If user data is not in the response, create a basic user object with the username
          const basicUserData = { username: username };
          localStorage.setItem('user', JSON.stringify(basicUserData));
        }
        
        // Double-check that user data was properly set
        try {
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
            throw new Error('User data not saved');
          }
          // Verify we can parse it
          JSON.parse(storedUser);
        } catch (err) {
          console.error('Error storing user data:', err);
          // Set a fallback if there's an issue
          localStorage.setItem('user', JSON.stringify({ username: username }));
        }
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async signup(userData: { email: string, username: string, password: string }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/`, userData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      // Safely parse the JSON
      const userData = JSON.parse(user);
      return userData;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear the corrupted data
      localStorage.removeItem('user');
      return null;
    }
  },

  // Get just the username in a safe way
  getUsername() {
    const user = this.getUser();
    return user?.username || null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService; 