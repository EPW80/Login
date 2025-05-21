const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { Web3 } = require("web3");
const { generateNonce } = require("../utils/crypto");

// Initialize Web3 with provider if available
const web3 = new Web3(process.env.ETH_NODE_URL);

exports.authenticate = async (req, res, next) => {
  const { publicAddress, signature } = req.body;

  try {
    const user = await User.findOne({ publicAddress });
    if (!user) return res.status(401).json({ error: "User not found" });

    // Create the message that was signed (must match frontend exactly)
    const message = `Sign this message to confirm your identity: ${user.nonce}`;

    // Verify signature using proper Ethereum personal message format
    try {
      // Web3.js v4 signature verification with personal message
      const recoveredAddress = web3.eth.accounts.recover({
        data: message,
        signature: signature,
      });

      if (recoveredAddress.toLowerCase() !== publicAddress.toLowerCase()) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    } catch (verifyError) {
      console.error("Verification error:", verifyError);
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // Update nonce for security
    user.nonce = generateNonce();
    await user.save();

    // Generate JWT
    const token = jwt.sign({ publicAddress }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || "1h",
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};
