import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // MUST be true for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('📤 With credentials:', config.withCredentials);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received:`, response.data);
    // Log cookies if any
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      console.log('🍪 Cookies set:', cookies);
    }
    return response;
  },
  (error) => {
    console.error(`❌ Request failed:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;