const crypto = require("crypto");

/**
 * Generate a cryptographically secure random nonce for authentication
 * @returns {string} Hexadecimal string representation of random bytes
 */
exports.generateNonce = () => {
  // Generate 16 bytes (128 bits) of cryptographically strong random data
  return crypto.randomBytes(16).toString("hex");
};
