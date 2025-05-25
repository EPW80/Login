const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
    unique: true, // Ensure token uniqueness
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  publicAddress: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "30d", // Auto-delete expired tokens
    index: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  userAgent: {
    type: String,
    maxlength: 500,
  },
  lastUsedIp: {
    type: String,
    maxlength: 45, // IPv6 max length
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true,
  },
});

// Compound index for efficient queries
refreshTokenSchema.index({ user: 1, createdAt: -1 });
refreshTokenSchema.index({ publicAddress: 1, expiresAt: 1 });

// Pre-save middleware to handle revoked tokens
refreshTokenSchema.pre("save", function (next) {
  if (this.isRevoked) {
    this.expiresAt = new Date(); // Immediately expire revoked tokens
  }
  next();
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
