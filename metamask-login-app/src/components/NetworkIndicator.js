import React from "react";
import "../styles/components/NetworkIndicator.css";

const NetworkIndicator = ({ network = "Ethereum Mainnet" }) => {
  return (
    <div className="network-indicator">
      <span className="network-dot"></span>
      {network}
    </div>
  );
};

export default NetworkIndicator;
