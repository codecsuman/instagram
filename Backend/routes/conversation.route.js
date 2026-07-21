// Backend/routes/conversation.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getConversations,
  getUnreadCount,
  markMessagesAsSeen,
} from "../controllers/conversation.controller.js";

const router = express.Router();

/* ------------------ GET ALL CONVERSATIONS ------------------ */
router.get("/all", isAuthenticated, getConversations);

/* ------------------ GET UNREAD COUNT ------------------ */
router.get("/unread", isAuthenticated, getUnreadCount);

/* ------------------ MARK MESSAGES AS SEEN ------------------ */
router.patch("/seen/:id", isAuthenticated, markMessagesAsSeen);

export default router;
