import React from "react";
import "../styles/components/NetworkIndicator.css";

const NetworkIndicator = ({ networkId }) => {
  // Map network IDs to network names
  const getNetworkName = (id) => {
    const networks = {
      1: "Ethereum Mainnet",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
      137: "Polygon Mainnet",
      80001: "Polygon Mumbai",
      56: "BSC Mainnet",
      97: "BSC Testnet",
      43114: "Avalanche Mainnet",
      43113: "Avalanche Fuji",
      10: "Optimism Mainnet",
      420: "Optimism Goerli",
      42161: "Arbitrum One",
      421613: "Arbitrum Goerli",
    };

    return networks[id] || `Network ${id}` || "Unknown Network";
  };

  // Show network indicator only if connected
  if (!networkId) {
    return null;
  }

  return (
    <div className="network-indicator">
      <span className="network-dot"></span>
      {getNetworkName(networkId)}
    </div>
  );
};

export default NetworkIndicator;
