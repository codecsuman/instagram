// socket.js
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
    origin: [CLIENT_URL],
    credentials: true,
  },
  transports: ["websocket", "polling"], // more stable
  pingTimeout: 60000,
  pingInterval: 25000,
});

// --------------------------------------------
// USER SOCKET MAPPING (supports MULTIPLE sockets)
// --------------------------------------------
// userId -> Set of socketIds
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
    console.log("❌ No userId found in handshake");
    socket.disconnect();
    return;
  }

  // Initialize SET if not exists
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }

  userSocketMap[userId].add(socket.id);

  console.log(`✅ User connected: ${userId} | Socket: ${socket.id}`);

  // Send updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));


  // -------------------------
  // REAL-TIME MESSAGE
  // -------------------------
  socket.on("sendMessage", ({ receiverId, message }) => {
    const receiverSockets = getReceiverSocketIds(receiverId);

    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("newMessage", message);
    });
  });


  // -------------------------
  // REAL-TIME NOTIFICATION
  // -------------------------
  socket.on("sendNotification", ({ receiverId, notification }) => {
    const receiverSockets = getReceiverSocketIds(receiverId);

    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("notification", notification);
    });
  });


  // -------------------------
  // DISCONNECT
  // -------------------------
  socket.on("disconnect", () => {
    if (userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);

      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }

    console.log(`❌ User disconnected: ${userId} | Socket: ${socket.id}`);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
