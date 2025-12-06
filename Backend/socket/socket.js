// socket.js
import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import express from "express";
import http from "http";

const CLIENT_URL = process.env.CLIENT_URL || "https://instagram-beta-sage.vercel.app";

export const app = express();
export const server = http.createServer(app);

// --------------------------------------------
// ✅ ALLOWED SOCKET ORIGINS
// --------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://instagram-beta-sage.vercel.app",
  CLIENT_URL,
];

// --------------------------------------------
// SOCKET.IO CONFIG
// --------------------------------------------
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// --------------------------------------------
// USER SOCKET MAPPING
// --------------------------------------------
const userSocketMap = {};

export const getReceiverSocketIds = (userId) => {
  return userSocketMap[userId] || new Set();
};

// --------------------------------------------
// MAIN SOCKET EVENTS
// --------------------------------------------
io.on("connection", (socket) => {
  const userId = socket.handshake.query?.userId;

  if (!userId) {
    console.log("❌ No userId found in socket handshake");
    socket.disconnect();
    return;
  }

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }

  userSocketMap[userId].add(socket.id);

  console.log(`✅ User connected: ${userId} | Socket: ${socket.id}`);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // REAL-TIME MESSAGE
  socket.on("sendMessage", ({ receiverId, message }) => {
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((id) => {
      io.to(id).emit("newMessage", message);
    });
  });

  // REAL-TIME NOTIFICATION
  socket.on("sendNotification", ({ receiverId, notification }) => {
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((id) => {
      io.to(id).emit("notification", notification);
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    userSocketMap[userId]?.delete(socket.id);

    if (userSocketMap[userId]?.size === 0) {
      delete userSocketMap[userId];
    }

    console.log(`❌ User disconnected: ${userId} | Socket: ${socket.id}`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
