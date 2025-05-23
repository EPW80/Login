const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Web3 } = require('web3');
const { generateNonce } = require('../utils/crypto');

// Initialize Web3 with provider
const web3 = new Web3(process.env.ETH_NODE_URL);

// Generate access token (short-lived)
const generateAccessToken = (publicAddress) => {
  return jwt.sign(
    { publicAddress }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );
};

// Generate refresh token (long-lived)
const generateRefreshToken = async (userId, publicAddress) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
  
  const refreshToken = new RefreshToken({
    token,
    user: userId,
    publicAddress,
    expiresAt
  });
  
  await refreshToken.save();
  return token;
};

// Authentication controller with refresh tokens
exports.authenticate = async (req, res, next) => {
  const { publicAddress, signature } = req.body;

  try {
    const user = await User.findOne({ publicAddress });
    if (!user) return res.status(401).json({ error: "User not found" });

    // Create the message that was signed
    const message = `Sign this message to confirm your identity: ${user.nonce}`;

    // Verify signature
    try {
      const recoveredAddress = web3.eth.accounts.recover({
        data: message,
        signature: signature
      });

      if (recoveredAddress.toLowerCase() !== publicAddress.toLowerCase()) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    } catch (verifyError) {
      console.error("Verification error:", verifyError);
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // Update nonce for security
    user.nonce = generateNonce();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(publicAddress);
    const refreshToken = await generateRefreshToken(user._id, publicAddress);

    res.json({ 
      accessToken, 
      refreshToken,
      expiresIn: parseInt(process.env.JWT_EXPIRY) || 3600 // seconds
    });
  } catch (err) {
    next(err);
  }
};

// Add refresh token endpoint
exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }
  
  try {
    const tokenDoc = await RefreshToken.findOne({ 
      token: refreshToken,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenDoc) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(tokenDoc.publicAddress);
    
    res.json({ 
      accessToken,
      expiresIn: parseInt(process.env.JWT_EXPIRY) || 3600 // seconds
    });
  } catch (err) {
    next(err);
  }
};

// Logout endpoint to invalidate refresh token
exports.logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }
  
  try {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
