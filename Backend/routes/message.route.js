import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

/* ------------------ SEND MESSAGE ------------------ */
router.post("/send/:id", isAuthenticated, sendMessage);

/* ------------------ GET ALL MESSAGES ------------------ */
router.get("/all/:id", isAuthenticated, getMessage);

export default router;
