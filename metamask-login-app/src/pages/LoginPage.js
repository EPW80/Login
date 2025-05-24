import React, { useState, useEffect } from "react";
import BrandLogo from "../components/BrandLogo";
import NetworkIndicator from "../components/NetworkIndicator";
import WalletConnect from "../components/WalletConnect";
import "../styles/components/LoginCard.css";
import "../styles/global.css";
import api from "../utils/api"; // Import the configured API instance

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkId, setNetworkId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add the missing handleApiError function
  const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      // Server responded with error status
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
      // Network error - no response received
      return "Network error. Please check your internet connection.";
    } else {
      // Something else happened
      console.error("Error:", error.message);
      return defaultMessage;
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
        // Remove console.log - handle silently or show UI indicator
        return;
      }

      try {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setNetworkId(parseInt(chainId, 16));
        } catch (chainError) {
          console.warn("Could not get chain ID:", chainError);
        }

        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (accountsError) {
          console.warn("Could not get accounts:", accountsError);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setWalletAddress("");
          setIsConnected(false);
        }
      };

      const handleChainChanged = (chainId) => {
        setNetworkId(parseInt(chainId, 16));
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
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask is not installed! Please install it first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletAddress(accounts[0]);
      setIsConnected(true);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkId(parseInt(chainId, 16));

      try {
        const userResponse = await api.post("/users/find-or-create", {
          publicAddress: accounts[0],
        });

        const nonce = userResponse.data.nonce;
        const message = `Sign this message to confirm your identity: ${nonce}`;
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, accounts[0]],
        });

        const authResponse = await api.post("/auth/authenticate", {
          publicAddress: accounts[0],
          signature,
        });

        if (authResponse.data.accessToken) {
          localStorage.setItem("accessToken", authResponse.data.accessToken);
          localStorage.setItem("refreshToken", authResponse.data.refreshToken);

          // Replace console.log with proper success handling
          setErrorMessage(""); // Clear any errors
          // Optional: Redirect to dashboard or show success message
          // window.location.href = '/dashboard';
        }
      } catch (authError) {
        const errorMessage = handleApiError(authError, "Authentication failed");
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      if (error.code === 4001) {
        setErrorMessage("Please connect your wallet to continue");
      } else {
        setErrorMessage("Error connecting to MetaMask. Please try again.");
      }
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

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert("Wallet address copied to clipboard!");
    }
  };

  // Replace placeholder click handler with proper implementation
  const handleSignUp = () => {
    // Option 1: Navigate to sign up page
    // window.location.href = '/signup';

    // Option 2: Show modal
    // setShowSignUpModal(true);

    // Option 3: For now, show informative message
    setErrorMessage("Sign up functionality coming soon!");
  };

  return (
    <div className="app">
      <div className="bg-animation"></div>
      <div className="blockchain-pattern"></div>
      <main>
        <BrandLogo />

        <div className="login-card">
          <NetworkIndicator networkId={networkId} />

          <h2 className="card-title">Connect Your Wallet</h2>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <WalletConnect
            connectWallet={connectWallet}
            isConnected={isConnected}
            walletAddress={formatAddress(walletAddress)}
            copyWalletAddress={copyWalletAddress}
            isLoading={isLoading}
          />
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
