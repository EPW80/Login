const express = require("express");
const router = express.Router();
const { validateAddress } = require("../middleware/validators");
const User = require("../models/User");
const { generateNonce } = require("../utils/crypto");
const userController = require("../controllers/users");

// Import rate limiters
const { authLimiter } = require('../middleware/security');

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

// Apply rate limiting to user creation endpoint
router.post("/find-or-create", 
  authLimiter,        // Rate limit user creation attempts
  userController.findOrCreate
);

module.exports = router;
