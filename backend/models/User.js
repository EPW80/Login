const mongoose = require("mongoose");

/**
 * User schema for MetaMask authentication
 * Stores Ethereum public address and authentication nonce
 */
const userSchema = new mongoose.Schema({
  publicAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  nonce: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

// Pre-save hook to ensure nonce is always set
userSchema.pre("save", function (next) {
  // If this is a new user without a nonce, generate one
  if (this.isNew && !this.nonce) {
    const { generateNonce } = require("../utils/crypto");
    this.nonce = generateNonce();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
