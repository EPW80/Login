const mongoose = require("mongoose");

/**
 * User schema for MetaMask authentication
 * Stores Ethereum public address and authentication nonce
 */
const userSchema = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      sparse: true, // Allows multiple null values
      unique: true, // But enforces uniqueness for non-null values
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // If publicAddress is provided, it should be a valid Ethereum address
          if (v) {
            return /^0x[a-fA-F0-9]{40}$/.test(v);
          }
          return true; // Allow null/undefined
        },
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
        validator: function (v) {
          // If email is provided, it should be valid
          if (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          }
          return true; // Allow null/undefined
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      sparse: true, // For wallet-only users
    },
    nonce: {
      type: String,
      required: true,
      default: () => Math.floor(Math.random() * 1000000).toString(),
    },
  },
  {
    timestamps: true,
  }
);

// Ensure at least one identifier is provided
userSchema.pre("save", function () {
  if (!this.publicAddress && !this.email) {
    throw new Error("Either publicAddress or email must be provided");
  }
});

module.exports = mongoose.model("User", userSchema);
