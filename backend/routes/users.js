const express = require("express");
const router = express.Router();
const { validateAddress } = require("../middleware/validators");
const User = require("../models/User");
const { generateNonce } = require("../utils/crypto");

// Get or create user
router.get("/", validateAddress, async (req, res, next) => {
  const { publicAddress } = req.query;

  try {
    let user = await User.findOne({ publicAddress });
    if (!user) {
      user = new User({ publicAddress, nonce: generateNonce() });
      await user.save();
    }
    res.json({ nonce: user.nonce });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
