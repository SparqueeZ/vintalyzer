import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://vintalyzer-production.up.railway.app",
  baseURL: "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
