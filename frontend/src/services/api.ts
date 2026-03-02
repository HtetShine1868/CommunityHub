import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Keep for cookies if needed
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    console.log('🔑 Token present:', !!token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ Error:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
      
      // If 401 Unauthorized, clear token and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;