const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Web3 } = require("web3");
const { generateNonce } = require("../utils/crypto");
const {
  sanitizeEthereumAddress,
  sanitizeSignature,
} = require("../middleware/sanitization");

// Initialize Web3 with provider
const web3 = new Web3(process.env.ETH_NODE_URL);

// Helper function to parse JWT expiry and return seconds with robust validation
const getJwtExpiryInSeconds = () => {
  const expiry = process.env.JWT_EXPIRY || "1h";

  // If it's already a number, validate and return it
  if (!isNaN(expiry)) {
    const numericValue = parseInt(expiry);
    if (numericValue <= 0) {
      console.warn(
        `Invalid JWT_EXPIRY value: ${expiry}, must be positive. Defaulting to 1 hour`
      );
      return 3600;
    }
    if (numericValue > 86400 * 30) {
      // Max 30 days
      console.warn(
        `JWT_EXPIRY value too large: ${expiry}, maximum is 30 days. Defaulting to 1 hour`
      );
      return 3600;
    }
    return numericValue;
  }

  // Validate string format
  if (typeof expiry !== "string") {
    console.warn(
      `Invalid JWT_EXPIRY type: ${typeof expiry}, expected string or number. Defaulting to 1 hour`
    );
    return 3600;
  }

  // Remove whitespace and convert to lowercase
  const normalizedExpiry = expiry.trim().toLowerCase();

  if (normalizedExpiry === "") {
    console.warn("Empty JWT_EXPIRY value, defaulting to 1 hour");
    return 3600;
  }

  // Parse time strings like '1h', '30m', '2d', '120s'
  const timeMap = {
    s: 1,
    sec: 1,
    second: 1,
    seconds: 1,
    m: 60,
    min: 60,
    minute: 60,
    minutes: 60,
    h: 3600,
    hr: 3600,
    hour: 3600,
    hours: 3600,
    d: 86400,
    day: 86400,
    days: 86400,
  };

  // Enhanced regex to support various formats
  const match = normalizedExpiry.match(
    /^(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hr|hour|hours|d|day|days)$/
  );

  if (match) {
    const [, value, unit] = match;
    const numericValue = parseInt(value);

    // Validate numeric value
    if (numericValue <= 0) {
      console.warn(
        `Invalid JWT_EXPIRY numeric value: ${value}, must be positive. Defaulting to 1 hour`
      );
      return 3600;
    }

    const multiplier = timeMap[unit];
    const totalSeconds = numericValue * multiplier;

    // Validate reasonable limits
    if (totalSeconds < 60) {
      // Minimum 1 minute
      console.warn(
        `JWT_EXPIRY too short: ${normalizedExpiry}, minimum is 1 minute. Setting to 1 minute`
      );
      return 60;
    }

    if (totalSeconds > 86400 * 30) {
      // Maximum 30 days
      console.warn(
        `JWT_EXPIRY too long: ${normalizedExpiry}, maximum is 30 days. Defaulting to 1 hour`
      );
      return 3600;
    }

    return totalSeconds;
  }

  // If parsing fails, log detailed error and use default
  console.warn(
    `Invalid JWT_EXPIRY format: "${expiry}". Expected formats: "1h", "30m", "7d", "3600" (seconds). Defaulting to 1 hour`
  );
  return 3600;
};

// Enhanced access token generation with validation
const generateAccessToken = (publicAddress) => {
  if (!publicAddress) {
    throw new Error("Public address is required for token generation");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const expiryInSeconds = getJwtExpiryInSeconds();

  try {
    return jwt.sign(
      {
        publicAddress,
        iat: Math.floor(Date.now() / 1000), // Issued at time
        type: "access_token",
      },
      process.env.JWT_SECRET,
      { expiresIn: expiryInSeconds }
    );
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate access token");
  }
};

// Enhanced refresh token generation with validation
const generateRefreshToken = async (userId, publicAddress) => {
  if (!userId || !publicAddress) {
    throw new Error(
      "User ID and public address are required for refresh token generation"
    );
  }

  try {
    // Clean up old refresh tokens for this user (optional security measure)
    await RefreshToken.deleteMany({
      user: userId,
      expiresAt: { $lt: new Date() },
    });

    // Limit number of active refresh tokens per user
    const activeTokensCount = await RefreshToken.countDocuments({
      user: userId,
      expiresAt: { $gt: new Date() },
    });

    if (activeTokensCount >= 5) {
      // Max 5 active tokens per user
      // Remove oldest token
      const oldestToken = await RefreshToken.findOne({
        user: userId,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: 1 });

      if (oldestToken) {
        await RefreshToken.deleteOne({ _id: oldestToken._id });
      }
    }

    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshToken = new RefreshToken({
      token,
      user: userId,
      publicAddress: publicAddress.toLowerCase(),
      expiresAt,
      createdAt: new Date(),
    });

    await refreshToken.save();
    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
};

// Authentication controller with refresh tokens
exports.authenticate = async (req, res, next) => {
  try {
    // Sanitize inputs with specific validators
    const publicAddress = sanitizeEthereumAddress(req.body.publicAddress);
    const signature = sanitizeSignature(req.body.signature);

    if (!publicAddress || !signature) {
      return res.status(400).json({ error: "Invalid input data" });
    }

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
        signature: signature,
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
    const refreshToken = await generateRefreshToken(
      user._id,
      normalizedAddress
    );

    res.json({
      accessToken,
      refreshToken,
      expiresIn: getJwtExpiryInSeconds(),
      user: {
        publicAddress: user.publicAddress,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Authentication error:", err);

    if (err.message.includes("Invalid")) {
      return res.status(400).json({ error: err.message });
    }

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
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenDoc.publicAddress);

    res.json({
      accessToken,
      expiresIn: getJwtExpiryInSeconds(),
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
