import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL,
  withCredentials: false,
});

export default api;
