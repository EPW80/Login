const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Web3 } = require('web3');
const { generateNonce } = require('../utils/crypto');

// Initialize Web3 with provider
const web3 = new Web3(process.env.ETH_NODE_URL);

// Helper function to parse JWT expiry and return seconds
const getJwtExpiryInSeconds = () => {
  const expiry = process.env.JWT_EXPIRY || '1h';
  
  // If it's already a number, return it
  if (!isNaN(expiry)) {
    return parseInt(expiry);
  }
  
  // Parse time strings like '1h', '30m', '2d'
  const timeMap = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };
  
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (match) {
    const [, value, unit] = match;
    return parseInt(value) * timeMap[unit];
  }
  
  // Default to 1 hour if parsing fails
  console.warn(`Invalid JWT_EXPIRY format: ${expiry}, defaulting to 1 hour`);
  return 3600;
};

// Generate access token (short-lived)
const generateAccessToken = (publicAddress) => {
  const expiryInSeconds = getJwtExpiryInSeconds();
  return jwt.sign(
    { publicAddress }, 
    process.env.JWT_SECRET, 
    { expiresIn: expiryInSeconds }
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
    // Normalize address to lowercase for consistency
    const normalizedAddress = publicAddress.toLowerCase();
    
    const user = await User.findOne({ publicAddress: normalizedAddress });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Create the message that was signed
    const message = `Sign this message to confirm your identity: ${user.nonce}`;

    // Verify signature
    try {
      const recoveredAddress = web3.eth.accounts.recover({
        data: message,
        signature: signature
      });

      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    } catch (verifyError) {
      console.error("Verification error:", verifyError);
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // Update nonce for security
    user.nonce = generateNonce();
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(normalizedAddress);
    const refreshToken = await generateRefreshToken(user._id, normalizedAddress);

    res.json({ 
      accessToken, 
      refreshToken,
      expiresIn: getJwtExpiryInSeconds(),
      user: {
        publicAddress: user.publicAddress,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Authentication error:", err);
    next(err);
  }
};

// Refresh token endpoint
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
      expiresIn: getJwtExpiryInSeconds()
    });
  } catch (err) {
    console.error("Refresh token error:", err);
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
    console.error("Logout error:", err);
    next(err);
  }
};