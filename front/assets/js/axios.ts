import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://vintalyzer-production.up.railway.app:3001",
  withCredentials: true,
});

export default axiosInstance;
