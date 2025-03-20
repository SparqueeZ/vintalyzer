import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.1.11:3001",
  withCredentials: true,
});

export default axiosInstance;
