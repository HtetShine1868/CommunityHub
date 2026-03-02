import axios from 'axios';

// 🔍 DEBUG: Log all possible sources
console.log('🔍 ===== API URL DEBUG =====');
console.log('1. import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('2. import.meta.env.MODE:', import.meta.env.MODE);
console.log('3. import.meta.env.PROD:', import.meta.env.PROD);
console.log('4. window.location.origin:', window.location.origin);
console.log('5. window.location.hostname:', window.location.hostname);

// Get API URL with fallback
const getApiUrl = () => {
  // Try import.meta.env first (Vite's way)
  if (import.meta.env.VITE_API_URL) {
    console.log('✅ Using VITE_API_URL from import.meta.env:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Try to construct from current origin (for same-domain deployment)
  const constructedUrl = `${window.location.origin}/api`;
  console.log('⚠️ VITE_API_URL not found, constructing from origin:', constructedUrl);
  return constructedUrl;
};

const API_URL = getApiUrl();
console.log('🎯 Final API_URL being used:', API_URL);
console.log('🔍 ===== END DEBUG =====\n');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('  → Full URL:', `${config.baseURL}${config.url}`);
    console.log('  → Token present:', !!token);
    
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
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ No response from server');
      console.error('  → URL attempted:', API_URL);
      console.error('  → Error:', error.message);
    } else {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;