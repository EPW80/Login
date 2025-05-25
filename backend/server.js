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
const cors = require("cors");

// Import security middleware
const {
  generalLimiter,
  securityHeaders,
  speedLimiter,
} = require("./middleware/security");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();

// Apply security middleware early in the middleware stack
app.use(securityHeaders);
app.use(speedLimiter);
app.use(generalLimiter); // Apply to all routes

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Trust proxy for accurate IP detection (important for rate limiting)
app.set("trust proxy", 1);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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

// JWT configuration validation
const validateJwtConfig = () => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET environment variable is required");
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "⚠️ JWT_SECRET should be at least 32 characters long for security"
    );
  }

  // Test JWT_EXPIRY parsing
  try {
    const getJwtExpiryInSeconds = () => {
      // Include the same function logic here for validation
      const expiry = process.env.JWT_EXPIRY || "1h"; // Default to 1 hour
      const match = expiry.match(/^(\d+)([smhd])$/);

      if (!match) {
        throw new Error("Invalid JWT_EXPIRY format. Use 1h, 30m, etc.");
      }

      const value = parseInt(match[1], 10);
      const unit = match[2];

      let seconds;
      switch (unit) {
        case "s":
          seconds = value;
          break;
        case "m":
          seconds = value * 60;
          break;
        case "h":
          seconds = value * 3600;
          break;
        case "d":
          seconds = value * 86400;
          break;
        default:
          throw new Error("Invalid JWT_EXPIRY unit. Use s, m, h, or d.");
      }

      return seconds;
    };

    const expirySeconds = getJwtExpiryInSeconds();
    console.log(
      `✅ JWT configuration valid. Token expiry: ${expirySeconds} seconds`
    );
  } catch (error) {
    console.error("❌ Invalid JWT configuration:", error.message);
    process.exit(1);
  }
};

// Call during server initialization
validateJwtConfig();

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Error handling middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
