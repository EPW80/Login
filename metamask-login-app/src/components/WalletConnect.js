import React, { useState, useEffect } from "react";
import "../styles/components/WalletConnect.css";

const WalletConnect = ({
  connectWallet,
  isConnected,
  walletAddress,
  copyWalletAddress,
  isLoading,
  isAuthenticated = false,
  authStatus = "idle", // Changed from connectionStatus to authStatus
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [buttonState, setButtonState] = useState("default");

  // Update button state based on connection status
  useEffect(() => {
    if (isLoading) {
      setButtonState("loading");
    } else if (isAuthenticated) {
      setButtonState("success");
    } else if (isConnected) {
      setButtonState("connected");
    } else {
      setButtonState("default");
    }
  }, [isLoading, isConnected, isAuthenticated]);

  const handleWalletClick = () => {
    if (!isConnected && !isLoading) {
      connectWallet();
    }
  };

  const handleCopyAddress = async () => {
    if (walletAddress && copyWalletAddress) {
      try {
        await copyWalletAddress();
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  // MetaMask Icon Component
  const MetaMaskIcon = () => (
    <svg
      className="metamask-icon"
      width="24"
      height="24"
      viewBox="0 0 318.6 318.6"
      fill="currentColor"
    >
      <path d="M274.1 35.5c-36.8-36.8-96.7-36.8-133.5 0L30.8 145.3c-36.8 36.8-36.8 96.7 0 133.5l109.8 109.8c36.8 36.8 96.7 36.8 133.5 0l109.8-109.8c36.8-36.8 36.8-96.7 0-133.5L274.1 35.5z" />
      <path
        d="M159.3 274.9c-31.4 0-56.8-25.4-56.8-56.8s25.4-56.8 56.8-56.8 56.8 25.4 56.8 56.8-25.4 56.8-56.8 56.8z"
        fill="#fff"
      />
    </svg>
  );

  // Success Checkmark Icon
  const SuccessIcon = () => (
    <svg
      className="success-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  );

  // Copy Icon Component
  const CopyIcon = ({ copied = false }) => (
    <svg
      className="copy-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {copied ? (
        <polyline points="20,6 9,17 4,12"></polyline>
      ) : (
        <>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </>
      )}
    </svg>
  );

  // Get button content based on state
  const getButtonContent = () => {
    switch (
      authStatus // Changed from connectionStatus to authStatus
    ) {
      case "connecting":
        return (
          <>
            <span className="spinner"></span>
            <span>Connecting Wallet...</span>
          </>
        );
      case "signing":
        return (
          <>
            <span className="pulse-dot"></span>
            <span>Please Sign Message</span>
          </>
        );
      case "connected":
      case "authenticated":
        return (
          <>
            <SuccessIcon />
            <span>Wallet Connected</span>
          </>
        );
      default:
        return (
          <>
            <MetaMaskIcon />
            <span>Connect MetaMask</span>
          </>
        );
    }
  };

  // Get button class names
  const getButtonClassName = () => {
    const baseClasses = ["btn", "btn-wallet"];

    switch (buttonState) {
      case "loading":
        baseClasses.push("btn-wallet--loading");
        break;
      case "connected":
        baseClasses.push("btn-wallet--connected");
        break;
      case "success":
        baseClasses.push("btn-wallet--success");
        break;
      default:
        break;
    }

    return baseClasses.join(" ");
  };

  const getConnectionStatusText = () => {
    switch (
      authStatus // Changed from connectionStatus to authStatus
    ) {
      case "connecting":
        return "Connecting...";
      case "signing":
        return "Awaiting Signature";
      case "authenticated":
        return "Authenticated";
      case "connected":
        return "Connected";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <button
          className={getButtonClassName()}
          onClick={handleWalletClick}
          disabled={isLoading}
        >
          {getButtonContent()}
        </button>
      ) : (
        <div
          className={`wallet-connected ${
            isAuthenticated ? "wallet-connected--authenticated" : ""
          }`}
        >
          <div className="wallet-info">
            {/* Connection Status */}
            <div className="wallet-status">
              <div className="status-dot"></div>
              <span className="wallet-label">{getConnectionStatusText()}</span>
            </div>

            {/* Wallet Address Display */}
            <div
              className="wallet-address"
              onClick={handleCopyAddress}
              title="Click to copy address"
            >
              <span className="address-text">{walletAddress}</span>
              <CopyIcon copied={showCopied} />
            </div>

            {/* Connection Details */}
            {isAuthenticated && (
              <div className="connection-details">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">Authenticated</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Session:</span>
                  <span className="detail-value">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copy Success Notification */}
      {showCopied && (
        <div className="copy-notification">
          <SuccessIcon />
          <span>Address copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
