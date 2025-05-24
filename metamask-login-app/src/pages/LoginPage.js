import React, { useState, useEffect } from "react";
import BrandLogo from "../components/BrandLogo";
import NetworkIndicator from "../components/NetworkIndicator";
import WalletConnect from "../components/WalletConnect";
import StatusMessage from "../components/StatusMessage";
import "../styles/components/LoginCard.css";
import "../styles/global.css";
import api from "../utils/api";

const LoginPage = () => {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkId, setNetworkId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle"); // idle, connecting, signing, authenticated
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Enhanced error handling with better user messages
  const handleApiError = (error, defaultMessage) => {
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
  };

  // Set message with auto-clear functionality
  const setStatusMessage = (text, type = "error", duration = 5000) => {
    setMessage({ text, type });
    if (duration > 0) {
      setTimeout(() => setMessage({ text: "", type: "" }), duration);
    }
  };

  const isMetaMaskAvailable = () => {
    return (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      window.ethereum.isMetaMask
    );
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskAvailable()) {
        setStatusMessage(
          "MetaMask not detected. Please install MetaMask to continue.",
          "warning",
          0
        );
        return;
      }

      try {
        // Check chain
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setNetworkId(parseInt(chainId, 16));
        } catch (chainError) {
          console.warn("Could not get chain ID:", chainError);
        }

        // Check existing connection
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            setAuthStatus("connected");
            setStatusMessage("Wallet connected successfully!", "success", 3000);
          }
        } catch (accountsError) {
          console.warn("Could not get accounts:", accountsError);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();

    // Event listeners for MetaMask changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          setAuthStatus("connected");
          setStatusMessage("Account switched successfully!", "success", 3000);
        } else {
          setWalletAddress("");
          setIsConnected(false);
          setAuthStatus("idle");
          setStatusMessage("Wallet disconnected", "info", 3000);
        }
      };

      const handleChainChanged = (chainId) => {
        setNetworkId(parseInt(chainId, 16));
        setStatusMessage("Network changed", "info", 2000);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatusMessage(
        "MetaMask is not installed! Please install it first.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    setAuthStatus("connecting");
    setMessage({ text: "", type: "" });

    try {
      // Step 1: Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletAddress(accounts[0]);
      setIsConnected(true);

      // Get network info
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkId(parseInt(chainId, 16));

      setAuthStatus("signing");
      setStatusMessage("Please sign the message in MetaMask...", "info", 0);

      try {
        // Step 2: Get nonce from server
        const userResponse = await api.post("/users/find-or-create", {
          publicAddress: accounts[0],
        });

        const nonce = userResponse.data.nonce;
        const message = `Sign this message to confirm your identity: ${nonce}`;

        // Step 3: Sign message
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, accounts[0]],
        });

        setAuthStatus("authenticating");
        setStatusMessage("Verifying signature...", "info", 0);

        // Step 4: Authenticate with server
        const authResponse = await api.post("/auth/authenticate", {
          publicAddress: accounts[0],
          signature,
        });

        if (authResponse.data.accessToken) {
          localStorage.setItem("accessToken", authResponse.data.accessToken);
          localStorage.setItem("refreshToken", authResponse.data.refreshToken);

          setAuthStatus("authenticated");
          setShowSuccessAnimation(true);
          setStatusMessage("Successfully authenticated! Welcome!", "success", 0);

          // Hide success animation after 3 seconds
          setTimeout(() => setShowSuccessAnimation(false), 3000);
        }
      } catch (authError) {
        const errorMessage = handleApiError(authError, "Authentication failed");
        setStatusMessage(errorMessage, "error");
        setAuthStatus("connected");
      }
    } catch (error) {
      if (error.code === 4001) {
        setStatusMessage("Please connect your wallet to continue", "warning");
      } else if (error.code === -32002) {
        setStatusMessage(
          "Request already pending. Please check MetaMask.",
          "warning"
        );
      } else {
        setStatusMessage("Error connecting to MetaMask. Please try again.", "error");
      }
      setAuthStatus("idle");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const copyWalletAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setStatusMessage("Address copied to clipboard!", "success", 2000);
      } catch (error) {
        setStatusMessage("Failed to copy address", "error", 2000);
      }
    }
  };

  const handleSignUp = () => {
    setStatusMessage("Sign up functionality coming soon!", "info", 3000);
  };

  return (
    <div className="app">
      <div className="bg-animation"></div>
      <div className="blockchain-pattern"></div>
      
      {showSuccessAnimation && (
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
            {authStatus === "authenticated" ? "Welcome Back!" : "Connect Your Wallet"}
          </h2>

          <StatusMessage message={message} />

          <WalletConnect
            connectWallet={connectWallet}
            isConnected={isConnected}
            walletAddress={formatAddress(walletAddress)}
            copyWalletAddress={copyWalletAddress}
            isLoading={isLoading}
            authStatus={authStatus}
          />

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