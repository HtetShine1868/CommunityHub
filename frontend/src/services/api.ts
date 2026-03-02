import axios from 'axios';

// 🔥 DIRECT HARDCODE - This WILL work
const API_URL = 'https://communityhub-09ib.onrender.com/api';

console.log('🚀 USING HARDCODED URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;