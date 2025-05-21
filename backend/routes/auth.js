const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { validateAuth } = require("../middleware/validators");
const { authenticate } = require("../middleware/auth");

// Auth routes
router.post("/authentication", validateAuth, authController.authenticate);

// Protected route example
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

module.exports = router;
