import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import express from "express";
import http from "http";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const app = express();
export const server = http.createServer(app);

// --------------------------------------------
// SOCKET.IO CONFIG
// --------------------------------------------
export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
  transports: ["websocket"],   // Best for Render
  pingTimeout: 60000,
  pingInterval: 25000,
});

// --------------------------------------------
// USER SOCKET MAP
// --------------------------------------------
const userSocketMap = new Map(); // safer than plain object

export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId) || new Set();
};

// --------------------------------------------
// SOCKET EVENTS
// --------------------------------------------
io.on("connection", (socket) => {
  try {
    const userId = socket.handshake.query?.userId;

    if (!userId) {
      console.log("❌ Socket connection rejected: No userId");
      socket.disconnect();
      return;
    }

    // Add socket under user
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }

    userSocketMap.get(userId).add(socket.id);

    console.log(`✅ User connected: ${userId}, Socket: ${socket.id}`);

    // Emit online users list
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    // -------------------------
    // MESSAGE DELIVERY
    // -------------------------
    socket.on("sendMessage", ({ receiverId, message }) => {
      const receiverSockets = getReceiverSocketIds(receiverId);

      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("newMessage", message);
      });
    });

    // -------------------------
    // NOTIFICATIONS
    // -------------------------
    socket.on("sendNotification", ({ receiverId, notification }) => {
      const receiverSockets = getReceiverSocketIds(receiverId);

      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("notification", notification);
      });
    });

    // -------------------------
    // CLEANUP ON DISCONNECT
    // -------------------------
    socket.on("disconnect", () => {
      if (userSocketMap.has(userId)) {
        userSocketMap.get(userId).delete(socket.id);

        if (userSocketMap.get(userId).size === 0) {
          userSocketMap.delete(userId);
        }
      }

      console.log(`❌ User disconnected: ${userId}, Socket: ${socket.id}`);

      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });

  } catch (err) {
    console.error("❌ Socket error:", err.message);
    socket.disconnect();
  }
});
