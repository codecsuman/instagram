import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import express from "express";
import http from "http";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const app = express();
export const server = http.createServer(app);

// --------------------------------------------
// ✅ SOCKET.IO CONFIG (RENDER + VERCEL SAFE)
// --------------------------------------------
export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],   // Required for Render
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,             // ✅ Fix handshake issues
});

// --------------------------------------------
// USER SOCKET MAP
// --------------------------------------------
const userSocketMap = new Map();

export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId) || [];
};

// --------------------------------------------
// SOCKET EVENTS
// --------------------------------------------
io.on("connection", (socket) => {
  try {
    const userId = socket.handshake.query?.userId;

    if (!userId) {
      console.log("❌ Socket rejected: Missing userId");
      socket.disconnect(true);
      return;
    }

    // ----------------------------
    // REGISTER SOCKET TO USER
    // ----------------------------
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }

    userSocketMap.get(userId).add(socket.id);

    console.log(`✅ Socket connected → User: ${userId} | Socket: ${socket.id}`);

    // Send fresh online list
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    // ----------------------------
    // MESSAGE DELIVERY
    // ----------------------------
    socket.on("sendMessage", ({ receiverId, message }) => {
      if (!receiverId || !message) return;

      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("newMessage", message);
      });
    });

    // ----------------------------
    // NOTIFICATIONS
    // ----------------------------
    socket.on("sendNotification", ({ receiverId, notification }) => {
      if (!receiverId || !notification) return;

      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("notification", notification);
      });
    });

    // ----------------------------
    // CLEANUP ON DISCONNECT
    // ----------------------------
    socket.on("disconnect", () => {
      if (userSocketMap.has(userId)) {
        userSocketMap.get(userId).delete(socket.id);

        if (userSocketMap.get(userId).size === 0) {
          userSocketMap.delete(userId);
        }
      }

      console.log(`❌ Socket disconnected → User: ${userId} | Socket: ${socket.id}`);

      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });

  } catch (err) {
    console.error("❌ Socket error:", err.message);
    socket.disconnect(true);
  }
});
