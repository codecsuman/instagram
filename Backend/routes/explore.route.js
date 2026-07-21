// Backend/routes/explore.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getExplorePosts } from "../controllers/explore.controller.js";

const router = express.Router();

/* ------------------ GET EXPLORE POSTS ------------------ */
router.get("/posts", isAuthenticated, getExplorePosts);

export default router;
