const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss");

// XSS protection configuration
const xssOptions = {
  whiteList: {}, // Allow no HTML tags
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"],
};

// Enhanced input sanitization
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === "object") {
      sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === "object") {
      sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === "object") {
      sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error("Sanitization error:", error);
    res.status(400).json({ error: "Invalid input data" });
  }
};

// Recursive function to sanitize nested objects
const sanitizeObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string") {
      // Remove XSS attempts
      obj[key] = xss(obj[key], xssOptions);

      // Trim whitespace
      obj[key] = obj[key].trim();

      // Special handling for Ethereum addresses (preserve case)
      if (key === "publicAddress" && obj[key].startsWith("0x")) {
        // Don't modify Ethereum addresses beyond XSS cleaning
        return;
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      // Recursively sanitize nested objects
      sanitizeObject(obj[key]);
    }
  });
};

// Specific sanitizer for Ethereum addresses
const sanitizeEthereumAddress = (address) => {
  if (!address || typeof address !== "string") {
    return null;
  }

  // Basic XSS protection without altering the hex format
  const cleaned = xss(address, { whiteList: {} });

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(cleaned)) {
    throw new Error("Invalid Ethereum address format");
  }

  return cleaned.toLowerCase(); // Normalize to lowercase
};

// Specific sanitizer for signatures
const sanitizeSignature = (signature) => {
  if (!signature || typeof signature !== "string") {
    return null;
  }

  // Remove any potential XSS
  const cleaned = xss(signature, { whiteList: {} });

  // Validate signature format (should be hex)
  if (!/^0x[a-fA-F0-9]+$/.test(cleaned)) {
    throw new Error("Invalid signature format");
  }

  return cleaned;
};

module.exports = {
  sanitizeInput,
  sanitizeEthereumAddress,
  sanitizeSignature,
  mongoSanitize, // Re-export for use in server.js
};
