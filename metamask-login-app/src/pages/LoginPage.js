import React, { useState, useEffect } from "react";
import BrandLogo from "../components/BrandLogo";
import NetworkIndicator from "../components/NetworkIndicator";
import WalletConnect from "../components/WalletConnect";
import EmailForm from "../components/EmailForm";
import "../styles/components/LoginCard.css";
import "../styles/global.css";
import axios from "axios"; // Make sure to install this: npm install axios

const LoginPage = () => {
  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkId, setNetworkId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to check MetaMask availability
  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  };

  // Check if MetaMask is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskAvailable()) {
        console.log("MetaMask is not available");
        return;
      }
      
      try {
        // Try to get network ID - wrap in try/catch
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetworkId(parseInt(chainId, 16));
        } catch (chainError) {
          console.warn("Could not get chain ID:", chainError);
        }
        
        // Try to get connected accounts
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
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
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setWalletAddress("");
          setIsConnected(false);
        }
      });
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        setNetworkId(parseInt(chainId, 16));
      });
    }
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Replace with your actual authentication endpoint
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Redirect or update UI state here
        console.log("Login successful!");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Wallet connection handler - actual implementation
  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask is not installed! Please install it first.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      
      // Get current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkId(parseInt(chainId, 16));
      
      // Optional: Get nonce and sign message for auth
      try {
        // First check if the user exists or create a new one
        const userResponse = await axios.post('http://localhost:8000/api/users/find-or-create', {
          publicAddress: accounts[0]
        });
        
        // Get the nonce from the user
        const nonce = userResponse.data.nonce;
        
        // Ask user to sign the message
        const message = `Sign this message to confirm your identity: ${nonce}`;
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, accounts[0]]
        });
        
        // Verify the signature on the backend
        const authResponse = await axios.post('http://localhost:8000/api/auth/authenticate', {
          publicAddress: accounts[0],
          signature
        });
        
        // Store the token
        if (authResponse.data.token) {
          localStorage.setItem('token', authResponse.data.token);
          console.log("Wallet authentication successful!");
        }
      } catch (authError) {
        console.error("Authentication error:", authError);
        // Still connected to wallet, but auth failed
      }
    } catch (error) {
      if (error.code === 4001) {
        // User rejected the request
        setErrorMessage("Please connect your wallet to continue");
      } else {
        setErrorMessage("Error connecting to MetaMask. Please try again.");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert("Wallet address copied to clipboard!");
    }
  };

  return (
    <div className="app">
      <div className="bg-animation"></div>
      <div className="blockchain-pattern"></div>
      <main>
        {/* Brand Logo Component */}
        <BrandLogo />

        <div className="login-card">
          {/* Network Indicator Component */}
          <NetworkIndicator networkId={networkId} />

          <h2 className="card-title">Sign In</h2>

          {/* Wallet Connection Component */}
          <WalletConnect
            connectWallet={connectWallet}
            isConnected={isConnected}
            walletAddress={formatAddress(walletAddress)}
            copyWalletAddress={copyWalletAddress}
            isLoading={isLoading}
          />

          {/* Email Form Component */}
          <EmailForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        <div className="login-footer">
          Don't have an account?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={() => console.log("Sign up clicked")}
          >
            Sign up
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
