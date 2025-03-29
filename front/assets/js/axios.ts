import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://vintalyzer-production.up.railway.app", // Changed to HTTPS
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
