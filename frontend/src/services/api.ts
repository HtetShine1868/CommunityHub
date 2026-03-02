import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log('🚀 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

// Set initial token if exists
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Function to set token
export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Ensure token is in headers
    if (authToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Log headers for debugging
    console.log('📤 Headers:', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer ***' : 'none',
      'withCredentials': config.withCredentials,
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status}:`, response.config.url);
    
    // Check for token in response body (from login/register)
    if (response.data?.token) {
      console.log('🔑 Token received from server');
      setAuthToken(response.data.token);
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Error ${error.response.status}:`, error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('🚫 Unauthorized - clearing token');
        setAuthToken(null);
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ No response from server');
    } else {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;