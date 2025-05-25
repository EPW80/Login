// Create a centralized config file
const API_CONFIG = {
  // Base configuration
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api",
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  retries: parseInt(process.env.REACT_APP_API_RETRIES) || 3,

  // Request configuration
  headers: {
    "Content-Type": "application/json",
  },

  // Authentication configuration
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  maxRetryAttempts: 3,
  retryDelay: 1000, // 1 second

  // Endpoints
  endpoints: {
    auth: {
      authenticate: "/auth/authenticate",
      refreshToken: "/auth/refresh-token",
      logout: "/auth/logout",
    },
    users: {
      findOrCreate: "/users/find-or-create",
    },
  },

  // Environment-specific settings
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Validation
  validateConfig() {
    if (!this.baseURL) {
      throw new Error("API base URL is required");
    }

    if (!this.baseURL.startsWith("http")) {
      throw new Error("API base URL must start with http:// or https://");
    }

    if (this.timeout < 1000) {
      console.warn("API timeout is very low, consider increasing it");
    }

    return true;
  },
};

// Validate configuration on import
try {
  API_CONFIG.validateConfig();
} catch (error) {
  console.error("API Configuration Error:", error.message);
  throw error;
}

export default API_CONFIG;
