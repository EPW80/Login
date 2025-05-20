import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage("");
  };

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

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress.replace("...", ""));
    alert("Wallet address copied to clipboard!");
  };

  return (
    <div className="app">
      <div className="bg-animation"></div>
      <div className="blockchain-pattern"></div>
      <main>
        <div className="brand">
          <div className="logo">
            <div className="logo-inner">
              <svg
                className="logo-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
          </div>
          <h1 className="brand-name">Write-eo</h1>
          <p className="brand-tagline">Dapp Journal</p>
        </div>

        <div className="login-card">
          <div className="network-indicator">
            <span className="network-dot"></span>
            Ethereum Mainnet
          </div>

          <h2 className="card-title">Sign In</h2>

          <div className="wallet-options">
            <button
              className="btn btn-wallet btn-full"
              onClick={() => connectWallet("MetaMask")}
            >
              <svg
                className="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              Connect with MetaMask
            </button>

            <button
              className="btn btn-wallet btn-full"
              onClick={() => connectWallet("Coinbase Wallet")}
            >
              <svg
                className="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Connect with Coinbase Wallet
            </button>

            <button
              className="btn btn-wallet btn-full"
              onClick={() => connectWallet("WalletConnect")}
            >
              <svg
                className="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
              Connect with WalletConnect
            </button>
          </div>

          <div className="divider">or continue with email</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
                <svg
                  className="input-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  className="input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <svg
                  className="input-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>

              {errorMessage && (
                <div className="error-message">
                  <svg
                    className="error-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" className="checkbox" />
              <label htmlFor="remember">Remember me for 30 days</label>
            </div>

            <button
              type="button"
              className="forgot-password"
              onClick={() => console.log("Forgot password clicked")}
            >
              Forgot password?
            </button>

            <button type="submit" className="btn btn-primary btn-full">
              Sign In
              <svg
                className="btn-icon"
                style={{ marginLeft: "8px", marginRight: 0 }}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>

          {isConnected && (
            <div className="connected-wallet">
              <svg
                className="wallet-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span className="wallet-address">{walletAddress}</span>
              <button className="wallet-copy" onClick={copyWalletAddress}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          )}
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
