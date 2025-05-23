import React from "react";
import "../styles/components/Buttons.css";

/**
 * Button component - A reusable button with various style options
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant ('primary', 'wallet', etc.)
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Optional icon to show on the left
 * @param {React.ReactNode} props.rightIcon - Optional icon to show on the right
 * @param {function} props.onClick - Click handler
 * @param {string} props.type - Button type (submit, button, reset)
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = "primary",
  fullWidth = false,
  children,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
  className = "",
  ...rest
}) => {
  // Construct class names based on props
  const buttonClasses = [
    "btn",
    `btn-${variant}`,
    fullWidth ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={buttonClasses} onClick={onClick} {...rest}>
      {leftIcon && <span className="btn-icon">{leftIcon}</span>}
      {children}
      {rightIcon && (
        <span
          className="btn-icon"
          style={{ marginLeft: "8px", marginRight: 0 }}
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
