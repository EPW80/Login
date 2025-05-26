const User = require("../models/User");
const { generateNonce } = require("../utils/crypto");
const { sanitizeEthereumAddress } = require("../middleware/sanitization");

exports.findOrCreate = async (req, res, next) => {
  try {
    // Sanitize and validate Ethereum address
    const publicAddress = sanitizeEthereumAddress(req.body.publicAddress);

    if (!publicAddress) {
      return res
        .status(400)
        .json({ error: "Valid Ethereum address is required" });
    }

    // Normalize address to lowercase
    const normalizedAddress = publicAddress.toLowerCase();

    // Try to find user
    let user = await User.findOne({ publicAddress: normalizedAddress });

    // If user doesn't exist, create a new one
    if (!user) {
      user = new User({
        publicAddress: normalizedAddress,
        nonce: generateNonce(),
      });
      await user.save();
    }

    // Return user data
    res.json({
      publicAddress: user.publicAddress,
      nonce: user.nonce,
    });
  } catch (error) {
    console.error("User creation error:", error);

    if (error.message.includes("Invalid")) {
      return res.status(400).json({ error: error.message });
    }

    next(error);
  }
};
