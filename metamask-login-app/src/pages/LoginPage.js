import React, { useState } from "react";
import BrandLogo from "../components/BrandLogo";
import NetworkIndicator from "../components/NetworkIndicator";
import WalletConnect from "../components/WalletConnect";
import EmailForm from "../components/EmailForm";
import "../styles/components/LoginCard.css";
import "../styles/global.css";

const LoginPage = () => {
  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the form
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }

    // Simulate login API call
    console.log("Logging in with:", { email, password });

    // Clear form after successful login
    setEmail("");
    setPassword("");
  };

  // Wallet connection handler
  const connectWallet = (walletType) => {
    // Simulate wallet connection
    console.log(`Connecting to ${walletType}`);

    // Generate a random wallet address for demonstration
    const randomAddress =
      "0x" +
      Math.random().toString(16).substring(2, 8) +
      "..." +
      Math.random().toString(16).substring(2, 6);

    setWalletAddress(randomAddress);
    setIsConnected(true);
  };

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress.replace("...", ""));
    alert("Wallet address copied to clipboard!");
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
          <NetworkIndicator />

          <h2 className="card-title">Sign In</h2>

          {/* Wallet Connection Component */}
          <WalletConnect
            connectWallet={connectWallet}
            isConnected={isConnected}
            walletAddress={walletAddress}
            copyWalletAddress={copyWalletAddress}
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
