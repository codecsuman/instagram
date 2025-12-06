import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";

// Load socket server (app + server exported)
import { app, server } from "./socket/socket.js";

// ✅ TRUST RENDER PROXY (COOKIE FIX)
app.set("trust proxy", 1);

// Routes
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

// ENV
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// ----------------------------
// GLOBAL MIDDLEWARE
// ----------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------------
// ✅ FIXED CORS CONFIGURATION (WORKING)
// ----------------------------
const allowedOrigins = [
  CLIENT_URL,
  "https://instagram-beta-sage.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Allow exact origin or subdomains
      if (
        allowedOrigins.some((allowed) => origin.startsWith(allowed))
      ) {
        return callback(null, true);
      }

      console.error("❌ CORS BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ----------------------------
// ROUTES
// ----------------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// ----------------------------
// START SERVER
// ----------------------------
server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Allowed Origin:", CLIENT_URL);
});
