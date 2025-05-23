const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Auth routes
router.post("/authenticate", authController.authenticate);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
