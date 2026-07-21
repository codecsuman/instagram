// Backend/routes/report.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { reportPost } from "../controllers/report.controller.js";

const router = express.Router();

/* ------------------ REPORT POST ------------------ */
router.post("/post/:id", isAuthenticated, reportPost);

export default router;
