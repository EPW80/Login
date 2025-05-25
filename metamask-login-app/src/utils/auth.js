import axios from "axios";
import API_CONFIG from "../config/apiConfig";

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Use centralized configuration
    const response = await axios.post(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refreshToken}`,
      { refreshToken },
      {
        timeout: API_CONFIG.timeout,
        headers: API_CONFIG.headers,
      }
    );

    const { accessToken } = response.data;
    if (!accessToken) {
      throw new Error("No access token received");
    }

    localStorage.setItem("accessToken", accessToken);

    if (API_CONFIG.isDevelopment) {
      console.log("✅ Token refreshed successfully");
    }

    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);

    // Clear invalid tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    throw error;
  }
};

// Token storage helpers using centralized config
export const setAuthTokens = (accessToken, refreshToken) => {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  if (API_CONFIG.isDevelopment) {
    console.log("✅ Auth tokens stored");
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  if (API_CONFIG.isDevelopment) {
    console.log("🗑️ Auth tokens cleared");
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token expires within the threshold
    return (
      payload.exp < currentTime + API_CONFIG.tokenRefreshThreshold / 1000
    );
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
};
