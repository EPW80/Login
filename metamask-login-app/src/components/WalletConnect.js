import React from "react";
import "../styles/components/WalletConnect.css";

const WalletConnect = ({
  connectWallet,
  isConnected,
  walletAddress,
  copyWalletAddress,
  isLoading,
}) => {
  // Remove unused walletType parameter and fix the handler
  const handleWalletClick = () => {
    if (!isConnected && !isLoading) {
      connectWallet();
    }
  };

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <button
          className="btn btn-wallet"
          onClick={handleWalletClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="wallet-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
              Connect MetaMask
            </>
          )}
        </button>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-info">
            <span className="wallet-label">Connected:</span>
            <span className="wallet-address" onClick={copyWalletAddress}>
              {walletAddress}
              <svg
                className="copy-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path
                  fill="currentColor"
                  d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                />
              </svg>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;