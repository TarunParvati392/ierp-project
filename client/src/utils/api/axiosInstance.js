import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://ierp-server.onrender.com/api',
  withCredentials: true
});

export default axiosInstance;
