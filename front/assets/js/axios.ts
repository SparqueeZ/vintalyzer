import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://vintalyzer-production.up.railway.app",
  withCredentials: true,
});

export default axiosInstance;
