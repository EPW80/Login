import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getAccessToken, clearAuthTokens, isTokenExpired } from "../utils/auth";

const AuthContext = createContext();

// Auth action types
export const AUTH_ACTIONS = {
  CONNECT_START: "CONNECT_START",
  CONNECT_SUCCESS: "CONNECT_SUCCESS",
  AUTH_START: "AUTH_START",
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_ERROR: "AUTH_ERROR",
  DISCONNECT: "DISCONNECT",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_NETWORK: "SET_NETWORK",
  SET_STATUS_MESSAGE: "SET_STATUS_MESSAGE",
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.CONNECT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        authStatus: "connecting",
      };

    case AUTH_ACTIONS.CONNECT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isConnected: true,
        walletAddress: action.payload.address,
        networkId: action.payload.networkId,
        authStatus: "connected",
      };

    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        authStatus: "signing",
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        authStatus: "authenticated",
        error: null,
      };

    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
        authStatus: state.isConnected ? "connected" : "idle",
      };

    case AUTH_ACTIONS.DISCONNECT:
      return {
        ...state,
        isConnected: false,
        isAuthenticated: false,
        walletAddress: "",
        networkId: null,
        authStatus: "idle",
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_NETWORK:
      return { ...state, networkId: action.payload };

    case AUTH_ACTIONS.SET_STATUS_MESSAGE:
      return {
        ...state,
        statusMessage: {
          text: action.payload.text,
          type: action.payload.type,
        },
      };

    default:
      return state;
  }
};

const initialState = {
  isConnected: false,
  isAuthenticated: false,
  isLoading: false,
  walletAddress: "",
  networkId: null,
  error: null,
  authStatus: "idle", // idle, connecting, connected, signing, authenticated
  statusMessage: { text: "", type: "" },
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = getAccessToken();

      if (token && !isTokenExpired(token)) {
        dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS });
      }

      // Check for existing wallet connection
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            });
            dispatch({
              type: AUTH_ACTIONS.CONNECT_SUCCESS,
              payload: {
                address: accounts[0],
                networkId: parseInt(chainId, 16),
              },
            });
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkExistingAuth();
  }, []);

  // Helper functions
  const connectWallet = () => {
    dispatch({ type: AUTH_ACTIONS.CONNECT_START });
  };

  const walletConnected = (address, networkId) => {
    dispatch({
      type: AUTH_ACTIONS.CONNECT_SUCCESS,
      payload: { address, networkId },
    });
  };

  const startAuth = () => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
  };

  const authSuccess = () => {
    dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS });
  };

  const authError = (error) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_ERROR, payload: error });
  };

  const disconnect = () => {
    clearAuthTokens();
    dispatch({ type: AUTH_ACTIONS.DISCONNECT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const setNetwork = (networkId) => {
    dispatch({ type: AUTH_ACTIONS.SET_NETWORK, payload: networkId });
  };

  const setStatusMessage = (text, type = "info") => {
    dispatch({
      type: AUTH_ACTIONS.SET_STATUS_MESSAGE,
      payload: { text, type },
    });
  };

  const contextValue = {
    ...state,
    // Actions
    connectWallet,
    walletConnected,
    startAuth,
    authSuccess,
    authError,
    disconnect,
    clearError,
    setNetwork,
    setStatusMessage,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
