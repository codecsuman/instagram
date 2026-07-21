// Backend/index.js
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";

import connectDB from "./utils/db.js";
import { app, server } from "./socket/socket.js";

// routes
import conversationRoute from "./routes/conversation.route.js";
import exploreRoute from "./routes/explore.route.js";
import messageRoute from "./routes/message.route.js";
import postRoute from "./routes/post.route.js";
import reportRoute from "./routes/report.route.js";
import searchRoute from "./routes/search.route.js";
import userRoute from "./routes/user.route.js";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// -------------------------
// TRUST PROXY (important for Render / secure cookies)
// -------------------------
app.set("trust proxy", 1);

// -------------------------
// ALLOWED ORIGINS
// -------------------------
const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
  ...new Set(["http://localhost:5173", ...parseOrigins(CLIENT_URL)]),
];

// -------------------------
// SECURITY / GLOBAL MIDDLEWARE
// -------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(mongoSanitize());
app.use(xss());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server / same-origin requests without origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------
// HEALTH CHECK
// -------------------------
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Instagram Clone Backend API is running",
    environment: NODE_ENV,
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: NODE_ENV,
  });
});

// -------------------------
// API ROUTES
// -------------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/conversation", conversationRoute);
app.use("/api/v1/search", searchRoute);
app.use("/api/v1/explore", exploreRoute);
app.use("/api/v1/report", reportRoute);

// -------------------------
// 404 HANDLER
// -------------------------
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------------
// GLOBAL ERROR HANDLER
// -------------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: NODE_ENV === "development" ? err.message : undefined,
  });
});

// -------------------------
// START SERVER
// -------------------------
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Allowed Client URL: ${CLIENT_URL}`);
      console.log(`⚙️ Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
