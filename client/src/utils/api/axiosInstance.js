import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ierp-server.onrender.com/api",
  withCredentials: true, // For future cookie handling if needed
});

export default axiosInstance;
