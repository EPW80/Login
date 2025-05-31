const mongoose = require("mongoose");

/**
 * Enhanced User schema for MetaMask authentication
 * Stores Ethereum public address, authentication nonce, and activity tracking
 */

// Custom validator for Ethereum addresses
const isValidEthereumAddress = (address) => {
  if (!address) return true; // Allow null/undefined for sparse unique
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Custom validator for email addresses
const isValidEmail = (email) => {
  if (!email) return true; // Allow null/undefined for sparse unique
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const userSchema = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      sparse: true, // Allows multiple null values
      unique: true, // But enforces uniqueness for non-null values
      lowercase: true,
      trim: true,
      index: true, // For faster lookups during authentication
      validate: {
        validator: isValidEthereumAddress,
        message: "Invalid Ethereum address format",
      },
    },
    email: {
      type: String,
      sparse: true, // Allows multiple null values
      unique: true, // But enforces uniqueness for non-null values
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidEmail,
        message: "Invalid email format",
      },
    },
    username: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be less than 30 characters"],
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow null/undefined
          return /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message:
          "Username can only contain letters, numbers, underscores, and hyphens",
      },
    },
    password: {
      type: String,
      sparse: true, // For wallet-only users
      minlength: [8, "Password must be at least 8 characters"],
    },
    nonce: {
      type: String,
      required: true,
      index: true, // For faster lookups during auth
      default: () => Math.floor(Math.random() * 1000000).toString(),
    },
    lastLogin: {
      type: Date,
      index: true, // For analytics and session management
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ["wallet", "email", "hybrid"],
      default: "wallet",
      index: true,
    },
    metadata: {
      firstLoginAt: {
        type: Date,
        default: Date.now,
      },
      lastIPAddress: {
        type: String,
        validate: {
          validator: function (v) {
            if (!v) return true;
            // Basic IP validation (IPv4 and IPv6)
            const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
            const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            return ipv4Regex.test(v) || ipv6Regex.test(v);
          },
          message: "Invalid IP address format",
        },
      },
      userAgent: String,
      loginHistory: [
        {
          timestamp: {
            type: Date,
            default: Date.now,
          },
          ipAddress: String,
          userAgent: String,
          success: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    // Enhanced JSON transformation for security
    toJSON: {
      transform: (doc, ret) => {
        delete ret.nonce; // Don't expose nonce in JSON
        delete ret.password; // Don't expose password hash
        delete ret.metadata.loginHistory; // Don't expose full login history
        delete ret.__v; // Remove version key
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.nonce;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Compound indexes for optimized queries
userSchema.index({ publicAddress: 1, lastLogin: -1 }); // Auth + activity queries
userSchema.index({ email: 1, isActive: 1 }); // Email auth + status
userSchema.index({ lastLogin: -1, loginCount: -1 }); // Analytics queries
userSchema.index({ accountType: 1, isActive: 1 }); // User segmentation
userSchema.index({ "metadata.firstLoginAt": -1 }); // New user analytics

// Pre-save middleware for validation and data processing
userSchema.pre("save", function (next) {
  // Ensure at least one identifier is provided
  if (!this.publicAddress && !this.email) {
    return next(new Error("Either publicAddress or email must be provided"));
  }

  // Set account type based on available fields
  if (this.publicAddress && this.email) {
    this.accountType = "hybrid";
  } else if (this.email) {
    this.accountType = "email";
  } else {
    this.accountType = "wallet";
  }

  // Limit login history to last 10 entries
  if (
    this.metadata.loginHistory &&
    this.metadata.loginHistory.length > 10
  ) {
    this.metadata.loginHistory = this.metadata.loginHistory.slice(-10);
  }

  next();
});

// Instance methods for better encapsulation
userSchema.methods.updateLoginInfo = function (ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.metadata.lastIPAddress = ipAddress;
  this.metadata.userAgent = userAgent;

  // Add to login history
  this.metadata.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success: true,
  });

  return this.save();
};

userSchema.methods.generateNewNonce = function () {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  return this.nonce;
};

userSchema.methods.recordFailedLogin = function (ipAddress, userAgent) {
  this.metadata.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success: false,
  });

  return this.save();
};

// Static methods for common queries
userSchema.statics.findByAddress = function (publicAddress) {
  return this.findOne({
    publicAddress: publicAddress.toLowerCase(),
    isActive: true,
  });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });
};

userSchema.statics.getActiveUserCount = function () {
  return this.countDocuments({ isActive: true });
};

userSchema.statics.getRecentUsers = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    lastLogin: { $gte: cutoffDate },
    isActive: true,
  }).sort({ lastLogin: -1 });
};

// Virtual for user display name
userSchema.virtual("displayName").get(function () {
  if (this.username) return this.username;
  if (this.email) return this.email.split("@")[0];
  if (this.publicAddress)
    return `${this.publicAddress.substring(0, 6)}...${this.publicAddress.substring(38)}`;
  return "Anonymous User";
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
