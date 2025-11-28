import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";
import fs from "fs";

dotenv.config();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// ----- Middlewares -----
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS FIX (works on Render + localhost)
const corsOptions = {
    origin: true,
    credentials: true,
};

app.use(cors(corsOptions));

// ----- API ROUTES -----
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// ----- FRONTEND SERVING (SAFE MODE) -----
const frontendPath = path.join(__dirname, "frontend", "dist");

if (fs.existsSync(frontendPath)) {

    console.log("✅ Frontend build found, serving UI");

    app.use(express.static(frontendPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });

} else {
    console.warn("⚠️ Frontend build not found, only API is running");
}

// ----- SERVER START -----
server.listen(PORT, async () => {
    await connectDB();
    console.log(`✅ Server running at port ${PORT}`);
});
