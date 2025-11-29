// Backend/socket/socket.js
import { Server } from "socket.io";

let io = null;
const userSocketMap = {}; // userId -> socketId

export const initSocket = (server, allowedOrigins) => {

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log("❌ BLOCKED SOCKET ORIGIN:", origin);
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
    transports: ["websocket"], // most stable for Vercel
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket Connected:", socket.id);

    const userId = socket.handshake.query.userId;

    // Prevent invalid IDs
    if (!userId || userId === "undefined" || userId === "null") {
      console.log("⚠️ Invalid userId sent, disconnecting socket");
      socket.disconnect(true);
      return;
    }

    userSocketMap[userId] = socket.id;

    // Notify online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);

      if (userId) delete userSocketMap[userId];

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const getIO = () => io;
