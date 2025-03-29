import axios from "axios";

// Determine the base URL for API calls
let baseURL = "";

// In production, use the configured API URL
if (process.env.NODE_ENV === "production") {
  baseURL = "https://vintalyzer-production.up.railway.app"; // No port in URL
} else {
  // In development, use localhost
  baseURL = "http://localhost:3000";
}

// Create axios instance with proper configuration
const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Add a request interceptor to handle tokens
instance.interceptors.request.use(
  (config) => {
    // Check if we have a token in local storage
    const token = localStorage.getItem("ext_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Log CORS and network errors for easier debugging
      if (error.response.status === 0 || error.code === "ERR_NETWORK") {
        console.error("Network or CORS error:", error);
      }

      // Handle authentication errors
      if (error.response.status === 401 || error.response.status === 403) {
        // You could automatically redirect to login here if needed
        localStorage.removeItem("ext_token");
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
