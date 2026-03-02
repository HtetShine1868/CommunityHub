import axios from 'axios';

// 🔥 HARDCODED WORKING URL - Use this until env vars work
const API_URL = 'https://communityhub-09ib.onrender.com/api';

console.log('🚀 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;