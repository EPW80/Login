// Generate a random nonce for authentication
exports.generateNonce = () => {
  return Math.floor(Math.random() * 100000000000000000).toString(16);
};