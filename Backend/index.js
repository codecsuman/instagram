import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);

// ✅ PORT
const PORT = process.env.PORT || 10000;

// ✅ TRUST PROXY (IMPORTANT FOR COOKIES ON RENDER)
app.set("trust proxy", 1);

// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  "http://localhost:5173",
  "https://instagram-dun-nine.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

// ✅ CORS CONFIG (FIXED)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/mobile

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("❌ CORS BLOCKED:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ BODY PARSERS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ ROUTES
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend is Running");
});

// ✅ SOCKET.IO
initSocket(server, allowedOrigins);

// ✅ SERVER START
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
