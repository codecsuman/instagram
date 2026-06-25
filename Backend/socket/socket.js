// Backend/socket/socket.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";

export const app = express();
export const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// -----------------------------
// ALLOWED SOCKET ORIGINS
// -----------------------------
const allowedOrigins = [...new Set([
  "http://localhost:5173",
  CLIENT_URL,
])].filter(Boolean);

// -----------------------------
// SOCKET.IO SERVER
// -----------------------------
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// -----------------------------
// USER SOCKET MAP
// userId -> Set(socketId)
// -----------------------------
const userSocketMap = new Map();

// get all socket ids for a user
export const getReceiverSocketIds = (userId) => {
  if (!userId) return new Set();
  return userSocketMap.get(String(userId)) || new Set();
};

// get online user ids
export const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

// add socket for user
const addUserSocket = (userId, socketId) => {
  const key = String(userId);

  if (!userSocketMap.has(key)) {
    userSocketMap.set(key, new Set());
  }

  userSocketMap.get(key).add(socketId);
};

// remove socket for user
const removeUserSocket = (userId, socketId) => {
  const key = String(userId);

  if (!userSocketMap.has(key)) return;

  const sockets = userSocketMap.get(key);
  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSocketMap.delete(key);
  }
};

// -----------------------------
// SOCKET CONNECTION
// -----------------------------
io.on("connection", (socket) => {
  try {
    const userId = socket.handshake.query?.userId;

    if (!userId) {
      console.log("❌ Socket rejected: missing userId");
      socket.disconnect(true);
      return;
    }

    addUserSocket(userId, socket.id);

    console.log(`✅ User connected: ${userId} | Socket: ${socket.id}`);

    // broadcast online users
    io.emit("getOnlineUsers", getOnlineUsers());

    // -----------------------------
    // SEND MESSAGE
    // payload: { receiverId, message }
    // -----------------------------
    socket.on("sendMessage", ({ receiverId, message }) => {
      if (!receiverId || !message) return;

      const receiverSockets = getReceiverSocketIds(receiverId);

      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("newMessage", message);
      });
    });

    // -----------------------------
    // SEND NOTIFICATION
    // payload: { receiverId, notification }
    // -----------------------------
    socket.on("sendNotification", ({ receiverId, notification }) => {
      if (!receiverId || !notification) return;

      const receiverSockets = getReceiverSocketIds(receiverId);

      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("notification", notification);
      });
    });

    // optional typing events
    socket.on("typing", ({ receiverId, senderId }) => {
      if (!receiverId || !senderId) return;

      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("typing", { senderId });
      });
    });

    socket.on("stopTyping", ({ receiverId, senderId }) => {
      if (!receiverId || !senderId) return;

      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("stopTyping", { senderId });
      });
    });

    // disconnect
    socket.on("disconnect", () => {
      removeUserSocket(userId, socket.id);

      console.log(`❌ User disconnected: ${userId} | Socket: ${socket.id}`);
      io.emit("getOnlineUsers", getOnlineUsers());
    });
  } catch (error) {
    console.error("❌ Socket connection error:", error.message);
    socket.disconnect(true);
  }
});