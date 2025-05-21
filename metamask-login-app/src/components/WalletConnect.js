import React from "react";
import "../styles/components/WalletConnect.css";
import "../styles/components/Buttons.css";

const WalletConnect = ({
  connectWallet,
  isConnected,
  walletAddress,
  copyWalletAddress,
}) => {
  return (
    <>
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
    </>
  );
};

export default WalletConnect;
