import React, { useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import BrandLogo from "../components/BrandLogo";
import NetworkIndicator from "../components/NetworkIndicator";
import WalletConnect from "../components/WalletConnect";
import StatusMessage from "../components/StatusMessage";
import "../styles/components/LoginCard.css";
import "../styles/global.css";
import api from "../utils/api";
import API_CONFIG from "../config/apiConfig";

const LoginPage = () => {
  // Get all auth state and actions from context
  const {
    isConnected,
    isAuthenticated,
    isLoading,
    walletAddress,
    networkId,
    authStatus,
    error,
    statusMessage,
    connectWallet: startConnecting,
    walletConnected,
    startAuth,
    authSuccess,
    authError,
    disconnect,
    setNetwork,
    setStatusMessage,
    clearError,
  } = useAuth();

  // Enhanced error handling with better user messages
  const handleApiError = useCallback((error, defaultMessage) => {
    if (error.response) {
      const status = error.response.status;
      const serverMessage =
        error.response.data?.error || error.response.data?.message;

      switch (status) {
        case 400:
          return serverMessage || "Invalid request. Please check your input.";
        case 401:
          return "Authentication failed. Please try again.";
        case 403:
          return "Access denied. Please check your permissions.";
        case 404:
          return "Service not found. Please try again later.";
        case 429:
          return "Too many requests. Please wait a moment and try again.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return serverMessage || defaultMessage;
      }
    } else if (error.request) {
      return "Network error. Please check your internet connection.";
    } else {
      console.error("Error:", error.message);
      return defaultMessage;
    }
  }, []);

  const isMetaMaskAvailable = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      window.ethereum.isMetaMask
    );
  }, []);

  // Check initial connection state - Enhanced error handling
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskAvailable()) {
      authError("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }

    try {
      // Check chain with fallback
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setNetwork(parseInt(chainId, 16));
      } catch (chainError) {
        console.warn(
          "Could not get chain ID, using fallback:",
          chainError.message
        );
        // Try alternative method or set default
        try {
          const networkVersion = await window.ethereum.request({
            method: "net_version",
          });
          setNetwork(parseInt(networkVersion, 10));
        } catch (networkError) {
          console.warn("Could not get network version, using default");
          setNetwork(1); // Default to mainnet
        }
      }

      // Check existing connection
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          // Get chain ID again for connected wallet
          let chainId;
          try {
            chainId = await window.ethereum.request({ method: "eth_chainId" });
          } catch (e) {
            chainId = "0x1"; // Default to mainnet
          }

          walletConnected(accounts[0], parseInt(chainId, 16));
          setStatusMessage("Wallet connected successfully!", "success");
        }
      } catch (accountsError) {
        console.warn("Could not get accounts:", accountsError);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  }, [
    isMetaMaskAvailable,
    authError,
    setNetwork,
    walletConnected,
    setStatusMessage,
  ]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // MetaMask event listeners - Fixed dependencies
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          walletConnected(accounts[0], networkId);
          setStatusMessage("Account switched successfully!", "success");
        } else {
          disconnect();
          setStatusMessage("Wallet disconnected", "info");
        }
      };

      const handleChainChanged = (chainId) => {
        setNetwork(parseInt(chainId, 16));
        setStatusMessage("Network changed", "info");
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [networkId, walletConnected, disconnect, setNetwork, setStatusMessage]);

  // Main wallet connection function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      authError("MetaMask is not installed! Please install it first.");
      return;
    }

    startConnecting(); // Set loading state through context
    clearError(); // Clear any previous errors

    try {
      // Step 1: Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get network info
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const networkId = parseInt(chainId, 16);

      // Update context with wallet connection
      walletConnected(accounts[0], networkId);

      // Step 2: Start authentication process
      startAuth();
      setStatusMessage("Please sign the message in MetaMask...", "info");

      try {
        // Step 3: Find or create user
        const userResponse = await api.post(
          API_CONFIG.endpoints.users.findOrCreate,
          {
            publicAddress: accounts[0],
          }
        );

        const nonce = userResponse.data.nonce;
        const message = `Sign this message to confirm your identity: ${nonce}`;

        console.log("Message to sign:", message);
        console.log("Signing with account:", accounts[0]);

        // Request signature from MetaMask
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, accounts[0]],
        });

        console.log("Signature received:", signature);
        console.log("Signature type:", typeof signature);
        console.log("Signature length:", signature?.length);

        // Validate signature before sending
        if (
          !signature ||
          typeof signature !== "string" ||
          !signature.startsWith("0x")
        ) {
          throw new Error("Invalid signature received from MetaMask");
        }

        // Step 4: Authenticate with backend
        const authResponse = await api.post(
          API_CONFIG.endpoints.auth.authenticate,
          {
            publicAddress: accounts[0],
            signature: signature,
          }
        );

        if (authResponse.data.accessToken) {
          localStorage.setItem("accessToken", authResponse.data.accessToken);
          localStorage.setItem("refreshToken", authResponse.data.refreshToken);

          authSuccess();
          setStatusMessage("Successfully authenticated! Welcome!", "success");
        }
      } catch (authenticationError) {
        console.error("Authentication error:", authenticationError);
        const errorMessage = handleApiError(
          authenticationError,
          "Authentication failed"
        );
        authError(errorMessage);
      }
    } catch (walletError) {
      if (walletError.code === 4001) {
        authError("Please connect your wallet to continue");
      } else if (walletError.code === -32002) {
        authError("Request already pending. Please check MetaMask.");
      } else {
        authError("Error connecting to MetaMask. Please try again.");
      }
    }
  }, [
    authError,
    startConnecting,
    clearError,
    walletConnected,
    startAuth,
    setStatusMessage,
    handleApiError,
    authSuccess,
  ]);

  // Helper functions
  const formatAddress = useCallback((address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }, []);

  const copyWalletAddress = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setStatusMessage("Address copied to clipboard!", "success");
      } catch (error) {
        setStatusMessage("Failed to copy address", "error");
      }
    }
  }, [walletAddress, setStatusMessage]);

  const handleSignUp = useCallback(() => {
    setStatusMessage("Sign up functionality coming soon!", "info");
  }, [setStatusMessage]);

  // Auto-clear status messages after a delay
  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => {
        setStatusMessage("", "");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage.text, setStatusMessage]);

  return (
    <div className="app">
      <div className="bg-animation"></div>
      <div className="blockchain-pattern"></div>

      {/* Success Animation */}
      {authStatus === "authenticated" && (
        <div className="success-overlay">
          <div className="success-animation">
            <div className="checkmark-circle">
              <svg className="checkmark" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4"
                />
              </svg>
            </div>
            <h3>Authentication Successful!</h3>
          </div>
        </div>
      )}

      <main>
        <BrandLogo />

        <div className="login-card">
          <NetworkIndicator networkId={networkId} />

          <h2 className="card-title">
            {authStatus === "authenticated"
              ? "Welcome Back!"
              : "Connect Your Wallet"}
          </h2>

          {/* Status Messages */}
          {statusMessage.text && <StatusMessage message={statusMessage} />}

          {error && <StatusMessage message={{ text: error, type: "error" }} />}

          <WalletConnect
            connectWallet={connectWallet}
            isConnected={isConnected}
            walletAddress={formatAddress(walletAddress)}
            copyWalletAddress={copyWalletAddress}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            authStatus={authStatus}
          />

          {/* Authentication Success Section */}
          {authStatus === "authenticated" && (
            <div className="auth-success">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <circle cx="12" cy="12" r="10" fill="#10B981" />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="success-content">
                <h3>You're all set!</h3>
                <p>Your wallet is connected and authenticated.</p>
              </div>
            </div>
          )}
        </div>

        <div className="login-footer">
          Don't have an account?{" "}
          <button type="button" className="signup-link" onClick={handleSignUp}>
            Sign up
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
