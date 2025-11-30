import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

// ✅ Send message
router.post("/:id", isAuthenticated, sendMessage);

// ✅ Get all messages with a user
router.get("/:id", isAuthenticated, getMessage);

export default router;
