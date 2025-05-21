import React from 'react';

const BrandLogo = ({ name = "Write-eo", tagline = "Dapp Journal" }) => {
  return (
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
      <h1 className="brand-name">{name}</h1>
      <p className="brand-tagline">{tagline}</p>
    </div>
  );
};

export default BrandLogo;