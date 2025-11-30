import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

let io = null;
const userSocketMap = {}; // userId -> socketId

export const initSocket = (server, allowedOrigins) => {

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    transports: ["websocket"],
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    try {

      // ✅ Parse cookies SAFELY
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token =
        socket.handshake.auth?.token ||
        cookies.token;

      if (!token) {
        console.log("❌ Socket rejected: No token");
        socket.disconnect(true);
        return;
      }

      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const userId = decoded.userId.toString();

      // ✅ Store socket
      userSocketMap[userId] = socket.id;

      // ✅ Notify
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      });

    } catch (error) {
      console.error("❌ Socket auth failed:", error.message);
      socket.disconnect(true);
    }
  });
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
export const getIO = () => io;
