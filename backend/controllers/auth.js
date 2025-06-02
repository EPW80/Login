const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Web3 } = require("web3");
const { generateNonce } = require("../utils/crypto");
const Logger = require("../utils/logger");
const {
  sanitizeEthereumAddress,
  sanitizeSignature,
} = require("../middleware/sanitization");

// Initialize Web3 with provider (fallback to default if no provider)
const web3 = new Web3(
  process.env.ETH_NODE_URL || "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
);

// Helper function to parse JWT expiry and return seconds with robust validation
const getJwtExpiryInSeconds = () => {
  const expiry = process.env.JWT_EXPIRY || "1h";

  // If it's already a number, validate and return it
  if (!isNaN(expiry)) {
    const numericValue = parseInt(expiry);
    if (numericValue <= 0) {
      Logger.warn("Invalid JWT_EXPIRY value, using default", {
        provided: expiry,
        default: "1 hour",
      });
      return 3600;
    }
    if (numericValue > 86400 * 30) {
      Logger.warn("JWT_EXPIRY value too large, using default", {
        provided: expiry,
        maximum: "30 days",
        default: "1 hour",
      });
      return 3600;
    }
    return numericValue;
  }

  // Validate string format
  if (typeof expiry !== "string") {
    Logger.warn("Invalid JWT_EXPIRY type, using default", {
      type: typeof expiry,
      expected: "string or number",
      default: "1 hour",
    });
    return 3600;
  }

  const normalizedExpiry = expiry.trim().toLowerCase();

  if (normalizedExpiry === "") {
    Logger.warn("Empty JWT_EXPIRY value, using default", { default: "1 hour" });
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

  const match = normalizedExpiry.match(
    /^(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hr|hour|hours|d|day|days)$/
  );

  if (match) {
    const [, value, unit] = match;
    const numericValue = parseInt(value);

    if (numericValue <= 0) {
      Logger.warn("Invalid JWT_EXPIRY numeric value, using default", {
        value,
        default: "1 hour",
      });
      return 3600;
    }

    const multiplier = timeMap[unit];
    const totalSeconds = numericValue * multiplier;

    if (totalSeconds < 60) {
      Logger.warn("JWT_EXPIRY too short, setting to minimum", {
        provided: normalizedExpiry,
        minimum: "1 minute",
      });
      return 60;
    }

    if (totalSeconds > 86400 * 30) {
      Logger.warn("JWT_EXPIRY too long, using default", {
        provided: normalizedExpiry,
        maximum: "30 days",
        default: "1 hour",
      });
      return 3600;
    }

    return totalSeconds;
  }

  Logger.warn("Invalid JWT_EXPIRY format, using default", {
    provided: expiry,
    expectedFormats: ["1h", "30m", "7d", "3600"],
    default: "1 hour",
  });
  return 3600;
};

// Enhanced access token generation with validation
const generateAccessToken = (publicAddress) => {
  if (!publicAddress) {
    Logger.error("Access token generation failed", {
      reason: "Missing public address",
    });
    throw new Error("Public address is required for token generation");
  }

  if (!process.env.JWT_SECRET) {
    Logger.error("Access token generation failed", {
      reason: "Missing JWT_SECRET",
    });
    throw new Error("JWT_SECRET environment variable is required");
  }

  const expiryInSeconds = getJwtExpiryInSeconds();

  try {
    const token = jwt.sign(
      {
        publicAddress,
        iat: Math.floor(Date.now() / 1000),
        type: "access_token",
      },
      process.env.JWT_SECRET,
      { expiresIn: expiryInSeconds }
    );

    Logger.info("Access token generated successfully", {
      publicAddress,
      expiresIn: expiryInSeconds,
    });

    return token;
  } catch (error) {
    Logger.error("Error generating access token", {
      error: error.message,
      publicAddress,
    });
    throw new Error("Failed to generate access token");
  }
};

// Enhanced refresh token generation with validation
const generateRefreshToken = async (userId, publicAddress) => {
  if (!userId || !publicAddress) {
    Logger.error("Refresh token generation failed", {
      reason: "Missing required parameters",
      userId: !!userId,
      publicAddress: !!publicAddress,
    });
    throw new Error(
      "User ID and public address are required for refresh token generation"
    );
  }

  try {
    // Clean up old refresh tokens
    const cleanupResult = await RefreshToken.deleteMany({
      user: userId,
      expiresAt: { $lt: new Date() },
    });

    Logger.debug("Cleaned up expired refresh tokens", {
      userId,
      deletedCount: cleanupResult.deletedCount,
    });

    // Limit number of active refresh tokens per user
    const activeTokensCount = await RefreshToken.countDocuments({
      user: userId,
      expiresAt: { $gt: new Date() },
    });

    if (activeTokensCount >= 5) {
      const oldestToken = await RefreshToken.findOne({
        user: userId,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: 1 });

      if (oldestToken) {
        await RefreshToken.deleteOne({ _id: oldestToken._id });
        Logger.info("Removed oldest refresh token", {
          userId,
          tokenId: oldestToken._id,
        });
      }
    }

    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const refreshToken = new RefreshToken({
      token,
      user: userId,
      publicAddress: publicAddress.toLowerCase(),
      expiresAt,
      createdAt: new Date(),
    });

    await refreshToken.save();

    Logger.success("Refresh token generated successfully", {
      userId,
      publicAddress: publicAddress.toLowerCase(),
      expiresAt,
    });

    return token;
  } catch (error) {
    Logger.error("Error generating refresh token", {
      error: error.message,
      userId,
      publicAddress,
    });
    throw new Error("Failed to generate refresh token");
  }
};

// Enhanced Authentication controller with logger integration
exports.authenticate = async (req, res, next) => {
  const requestId = req.requestId || "unknown";

  try {
    Logger.info("Authentication request received", {
      requestId,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const { publicAddress, signature } = req.body;

    // Enhanced input validation
    if (!publicAddress || !signature) {
      Logger.warn("Authentication failed - missing required fields", {
        requestId,
        publicAddress: !!publicAddress,
        signature: !!signature,
      });
      return res.status(400).json({
        error: "Public address and signature are required",
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(publicAddress)) {
      Logger.warn("Authentication failed - invalid address format", {
        requestId,
        publicAddress: publicAddress.substring(0, 10) + "...",
      });
      return res.status(400).json({
        error: "Invalid Ethereum address format",
      });
    }

    // Validate signature format
    if (!signature || typeof signature !== "string") {
      Logger.warn("Authentication failed - invalid signature type", {
        requestId,
        signatureType: typeof signature,
      });
      return res.status(400).json({
        error: "Invalid signature format",
      });
    }

    if (!signature.startsWith("0x") || signature.length !== 132) {
      Logger.warn("Authentication failed - invalid signature format", {
        requestId,
        startsWithOx: signature.startsWith("0x"),
        length: signature.length,
      });
      return res.status(400).json({
        error:
          "Signature must be a valid Ethereum signature (0x + 130 hex characters)",
      });
    }

    // Sanitize inputs
    let sanitizedAddress, sanitizedSignature;
    try {
      sanitizedAddress = sanitizeEthereumAddress(publicAddress);
      sanitizedSignature = sanitizeSignature(signature);

      Logger.debug("Input sanitization successful", {
        requestId,
        originalAddress: publicAddress.substring(0, 10) + "...",
        sanitizedAddress: sanitizedAddress.substring(0, 10) + "...",
      });
    } catch (sanitizeError) {
      Logger.error("Input sanitization failed", {
        requestId,
        error: sanitizeError.message,
      });
      return res.status(400).json({ error: sanitizeError.message });
    }

    if (!sanitizedAddress || !sanitizedSignature) {
      Logger.error("Sanitization resulted in empty values", { requestId });
      return res
        .status(400)
        .json({ error: "Invalid input data after sanitization" });
    }

    const normalizedAddress = sanitizedAddress.toLowerCase();

    Logger.debug("Looking up user", {
      requestId,
      address: normalizedAddress.substring(0, 10) + "...",
    });

    // Find user by public address
    const user = await User.findOne({ publicAddress: normalizedAddress });
    if (!user) {
      Logger.warn("Authentication failed - user not found", {
        requestId,
        address: normalizedAddress.substring(0, 10) + "...",
      });
      return res.status(404).json({
        error: "User not found. Please create an account first.",
      });
    }

    Logger.info("User found for authentication", {
      requestId,
      userId: user._id,
      address: user.publicAddress.substring(0, 10) + "...",
      nonce: user.nonce,
    });

    // Create message for verification
    const message = `Sign this message to confirm your identity: ${user.nonce}`;

    Logger.debug("Starting signature verification", {
      requestId,
      messageLength: message.length,
      signatureLength: sanitizedSignature.length,
    });

    // Enhanced signature verification with multiple methods
    try {
      let recoveredAddress;
      let verificationMethod;

      try {
        // Method 1: Using Web3 recover with message hash
        recoveredAddress = web3.eth.accounts.recover({
          messageHash: web3.utils.keccak256(
            "\x19Ethereum Signed Message:\n" + message.length + message
          ),
          signature: sanitizedSignature,
        });
        verificationMethod = "messageHash";

        Logger.debug("Signature verification method 1 successful", {
          requestId,
          method: verificationMethod,
          recoveredAddress: recoveredAddress.substring(0, 10) + "...",
        });
      } catch (error1) {
        Logger.debug("Method 1 failed, trying method 2", {
          requestId,
          error: error1.message,
        });

        try {
          // Method 2: Using Web3 recover with plain message
          recoveredAddress = web3.eth.accounts.recover(
            message,
            sanitizedSignature
          );
          verificationMethod = "plainMessage";

          Logger.debug("Signature verification method 2 successful", {
            requestId,
            method: verificationMethod,
            recoveredAddress: recoveredAddress.substring(0, 10) + "...",
          });
        } catch (error2) {
          Logger.debug("Method 2 failed, trying method 3", {
            requestId,
            error: error2.message,
          });

          // Method 3: Manual message hash creation
          const messageHash = web3.utils.keccak256(
            "\x19Ethereum Signed Message:\n" + message.length + message
          );
          recoveredAddress = web3.eth.accounts.recover({
            messageHash: messageHash,
            signature: sanitizedSignature,
          });
          verificationMethod = "manualHash";

          Logger.debug("Signature verification method 3 successful", {
            requestId,
            method: verificationMethod,
            recoveredAddress: recoveredAddress.substring(0, 10) + "...",
          });
        }
      }

      // Compare addresses
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        Logger.warn("Authentication failed - address mismatch", {
          requestId,
          expected: normalizedAddress.substring(0, 10) + "...",
          recovered: recoveredAddress.toLowerCase().substring(0, 10) + "...",
          verificationMethod,
        });
        return res.status(401).json({
          error: "Invalid signature. Authentication failed.",
        });
      }

      Logger.success("Signature verification successful", {
        requestId,
        address: normalizedAddress.substring(0, 10) + "...",
        method: verificationMethod,
      });
    } catch (verificationError) {
      Logger.error("Signature verification failed", {
        requestId,
        error: verificationError.message,
        address: normalizedAddress.substring(0, 10) + "...",
      });
      return res.status(401).json({
        error: "Signature verification failed: " + verificationError.message,
      });
    }

    // Update user nonce and last login
    const oldNonce = user.nonce;
    user.nonce = generateNonce();
    user.lastLogin = new Date();
    await user.save();

    Logger.info("User updated after successful authentication", {
      requestId,
      userId: user._id,
      oldNonce: user.nonce,
      newNonce: user.generateNewNonce(),
    });

    await user.updateLoginInfo(req.ip, req.get("User-Agent"));

    // Generate tokens
    const accessToken = generateAccessToken(normalizedAddress);
    const refreshToken = await generateRefreshToken(
      user._id,
      normalizedAddress
    );

    Logger.success("Authentication completed successfully", {
      requestId,
      userId: user._id,
      address: normalizedAddress.substring(0, 10) + "...",
      tokenGenerated: true,
    });

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
    Logger.error("Authentication error", {
      requestId,
      error: err.message,
      stack: err.stack,
    });

    if (err.message.includes("Invalid")) {
      return res.status(400).json({ error: err.message });
    }

    next(err);
  }
};

// Refresh token endpoint with logger
exports.refreshToken = async (req, res, next) => {
  const requestId = req.requestId || "unknown";

  try {
    Logger.info("Token refresh request received", { requestId });

    const { refreshToken } = req.body;

    if (!refreshToken) {
      Logger.warn("Token refresh failed - missing refresh token", {
        requestId,
      });
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      Logger.warn("Token refresh failed - invalid or expired token", {
        requestId,
        tokenPrefix: refreshToken.substring(0, 10) + "...",
      });
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const accessToken = generateAccessToken(tokenDoc.publicAddress);

    Logger.success("Token refresh successful", {
      requestId,
      userId: tokenDoc.user,
      address: tokenDoc.publicAddress.substring(0, 10) + "...",
    });

    res.json({
      accessToken,
      expiresIn: getJwtExpiryInSeconds(),
    });
  } catch (err) {
    Logger.error("Token refresh error", {
      requestId,
      error: err.message,
    });
    next(err);
  }
};

// Logout endpoint with logger
exports.logout = async (req, res, next) => {
  const requestId = req.requestId || "unknown";

  try {
    Logger.info("Logout request received", { requestId });

    const { refreshToken } = req.body;

    if (!refreshToken) {
      Logger.warn("Logout failed - missing refresh token", { requestId });
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const result = await RefreshToken.deleteOne({ token: refreshToken });

    Logger.success("Logout successful", {
      requestId,
      tokensDeleted: result.deletedCount,
      tokenPrefix: refreshToken.substring(0, 10) + "...",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    Logger.error("Logout error", {
      requestId,
      error: err.message,
    });
    next(err);
  }
};
