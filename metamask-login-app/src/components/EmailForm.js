import React from "react";

const EmailForm = ({
  email,
  setEmail,
  password,
  setPassword,
  errorMessage,
  setErrorMessage,
  handleSubmit,
}) => {
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage("");
  };

  return (
    <>
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
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
    </>
  );
};

export default EmailForm;
