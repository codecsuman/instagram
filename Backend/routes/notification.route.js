import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getNotifications,
  markNotificationsAsRead,
  markSingleAsRead,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/all", isAuthenticated, getNotifications);
router.patch("/read", isAuthenticated, markNotificationsAsRead);
router.patch("/read/:id", isAuthenticated, markSingleAsRead);
router.delete("/clear", isAuthenticated, deleteAllNotifications);

export default router;
