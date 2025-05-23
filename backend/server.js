require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "ETH_NODE_URL"];

// In production, require MongoDB URI
if (process.env.NODE_ENV === "production") {
  requiredEnvVars.push("MONGODB_URI");
}

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error("Please set these variables in your .env file");
  process.exit(1);
}

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Database connection - improved with conditional logic
let dbUri = process.env.MONGODB_URI;
if (!dbUri) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("MongoDB URI is required in production");
  } else {
    console.warn("⚠️ No MONGODB_URI found, using local development database");
    dbUri = "mongodb://localhost/metamask-login";
  }
}

mongoose
  .connect(dbUri)
  .then(() => console.log("MongoDB connected to:", dbUri.split("@").pop())) // Show only host part for security
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
