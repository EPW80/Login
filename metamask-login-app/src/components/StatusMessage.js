import React from "react";
import "../styles/components/StatusMessage.css";

/**
 * StatusMessage component - Shows contextual messages with different styles
 *
 * @param {Object} props
 * @param {Object} props.message - Message object with text and type
 * @param {string} props.message.text - Message text to display
 * @param {string} props.message.type - Message type (error, success, warning, info)
 */
const StatusMessage = ({ message }) => {
  if (!message.text) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path
              d="M9 12l2 2 4-4"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "error":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <line
              x1="15"
              y1="9"
              x2="9"
              y2="15"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="9"
              y1="9"
              x2="15"
              y2="15"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );
      case "warning":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              fill="currentColor"
            />
            <line
              x1="12"
              y1="9"
              x2="12"
              y2="13"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="17"
              x2="12.01"
              y2="17"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );
      case "info":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <line
              x1="12"
              y1="16"
              x2="12"
              y2="12"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="8"
              x2="12.01"
              y2="8"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`status-message status-message--${message.type}`}>
      <div className="status-message__icon">{getIcon(message.type)}</div>
      <div className="status-message__text">{message.text}</div>
    </div>
  );
};

export default StatusMessage;
