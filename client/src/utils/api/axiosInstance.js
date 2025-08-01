import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // For future cookie handling if needed
});

export default axiosInstance;
