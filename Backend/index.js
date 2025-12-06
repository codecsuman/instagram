// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";

// Load socket server (app + server exported)
import { app, server } from "./socket/socket.js";

// ✅ TRUST RENDER PROXY (IMPORTANT FOR COOKIE)
app.set("trust proxy", 1);

// Routes
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

// ENV
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ----------------------------
// GLOBAL MIDDLEWARE
// ----------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------------
// ✅ CORS — FINAL PRODUCTION FIX (COOKIE SAFE)
// ----------------------------
const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false); // ✅ no crash
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
