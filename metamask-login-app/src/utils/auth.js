import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// Base refresh token functionality
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      return null;
    }

    // Use environment variable for API URL
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    const { accessToken } = response.data;
    localStorage.setItem("accessToken", accessToken);

    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
};

// Token storage helpers
export const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => localStorage.getItem("accessToken");
