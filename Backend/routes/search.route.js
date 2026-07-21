// Backend/routes/search.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { searchAll, searchUsers } from "../controllers/search.controller.js";

const router = express.Router();

/* ------------------ SEARCH EVERYTHING ------------------ */
router.get("/all", isAuthenticated, searchAll);

/* ------------------ SEARCH USERS ONLY ------------------ */
router.get("/users", isAuthenticated, searchUsers);

export default router;
