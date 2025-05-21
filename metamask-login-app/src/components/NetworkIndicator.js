import React from "react";

const NetworkIndicator = ({ network = "Ethereum Mainnet" }) => {
  return (
    <div className="network-indicator">
      <span className="network-dot"></span>
      {network}
    </div>
  );
};

export default NetworkIndicator;
