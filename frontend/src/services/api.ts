import axios from "axios";

// Dynamically use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("leadflow_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem("leadflow_token");
        localStorage.removeItem("leadflow_user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/" && window.location.pathname !== "/register") {
          window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);
