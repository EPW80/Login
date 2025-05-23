const User = require("../models/User");
const { generateNonce } = require("../utils/crypto");

exports.findOrCreate = async (req, res, next) => {
  const { publicAddress } = req.body;

  if (!publicAddress) {
    return res.status(400).json({ error: "Public address is required" });
  }

  try {
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
    next(error);
  }
};
