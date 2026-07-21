// Backend/socket/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Map to store userId -> Set of socket IDs
const userSocketMap = new Map();

/* --------------------------------------------------------
   GET RECEIVER SOCKET IDs
-------------------------------------------------------- */
export const getReceiverSocketIds = (receiverId) => {
  if (!receiverId) return new Set();
  const sockets = userSocketMap.get(receiverId.toString());
  return sockets || new Set();
};

/* --------------------------------------------------------
   SOCKET CONNECTION
-------------------------------------------------------- */
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    // Join room with userId for easy targeting
    socket.join(userId.toString());

    // Also store in our map for backup
    if (!userSocketMap.has(userId.toString())) {
      userSocketMap.set(userId.toString(), new Set());
    }
    userSocketMap.get(userId.toString()).add(socket.id);

    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  }

  // Send online users to all clients
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    if (userId) {
      const sockets = userSocketMap.get(userId.toString());
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId.toString());
        }
      }
      socket.leave(userId.toString());
      console.log(`⚠️ User ${userId} disconnected`);
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { app, io, server };
