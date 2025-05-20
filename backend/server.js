const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Web3 } = require("web3");
const User = require("./models/User");

const app = express();
const web3 = new Web3();

app.use(cors());
app.use(bodyParser.json());

const generateNonce = () =>
  Math.floor(Math.random() * 100000000000000000).toString(16);

// Fetch or create user
app.get("/api/users", async (req, res) => {
  const { publicAddress } = req.query;
  try {
    let user = await User.findOne({ publicAddress });
    if (!user) {
      user = new User({ publicAddress, nonce: generateNonce() });
      await user.save();
    }
    res.json({ nonce: user.nonce });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Authenticate user
app.post("/api/authentication", async (req, res) => {
  const { publicAddress, signature } = req.body;
  try {
    const user = await User.findOne({ publicAddress });
    if (!user) return res.status(401).json({ error: "User not found" });

    // Log for debugging
    console.log("User nonce:", user.nonce);
    console.log("Signature:", signature);

    // Verify signature
    try {
      const recoveredAddress = web3.eth.accounts.recover(user.nonce, signature);
      if (recoveredAddress.toLowerCase() !== publicAddress.toLowerCase()) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    } catch (verifyError) {
      console.error("Verification error:", verifyError);
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // Update nonce
    user.nonce = generateNonce();
    await user.save();

    // Issue JWT
    const token = jwt.sign({ publicAddress }, "your-secret-key", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Protected route example
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/api/protected", authenticate, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

mongoose
  .connect("mongodb://localhost/metamask-login")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(8000, () => console.log("Server running on port 8000"));
