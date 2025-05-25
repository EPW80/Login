import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import { refreshAccessToken } from "./auth";

// Create an instance with centralized configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Add request ID for debugging
    if (API_CONFIG.isDevelopment) {
      config.headers["X-Request-ID"] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return config;
  },
  (error) => {
    if (API_CONFIG.isDevelopment) {
      console.error('Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (API_CONFIG.isDevelopment) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log errors in development
    if (API_CONFIG.isDevelopment) {
      console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status || 'Network Error'}`);
    }
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        // Optional: Redirect to login page
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login';
        }
      }
    }
    
    // Retry logic for network errors
    if (!error.response && originalRequest._retryCount < API_CONFIG.retries) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Exponential backoff
      const delay = API_CONFIG.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
      
      if (API_CONFIG.isDevelopment) {
        console.log(`Retrying request (${originalRequest._retryCount}/${API_CONFIG.retries}) after ${delay}ms`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to create API endpoints
export const createEndpointUrl = (endpoint) => {
  return API_CONFIG.endpoints[endpoint] || endpoint;
};

// Export configured API instance
export default api;
