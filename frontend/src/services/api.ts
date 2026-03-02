import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

console.log('🚀 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 CRITICAL - sends cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - NO Authorization header (cookies handle auth)
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('🍪 Cookies being sent:', document.cookie);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Error ${error.response.status}:`, error.response.data);
      
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        console.log('🚫 Unauthorized - redirecting to login');
        window.location.href = '/login';
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