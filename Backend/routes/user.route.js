import express from "express";
import {
  editProfile,
  followOrUnfollow,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { User } from "../models/user.model.js";

const router = express.Router();

/* ================== SESSION CHECK ================== */
router.get("/profile-check", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.id).select("-password");
  res.json({ success: true, user });
});

/* ================== AUTH ================== */
router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);

/* ================== DATA ================== */
router.get("/suggested", isAuthenticated, getSuggestedUsers);
router.get("/:id/profile", isAuthenticated, getProfile);

/* ✅ PROFILE EDIT FIXED */
router.post(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePhoto"),
  editProfile
);

/* ✅ FOLLOW */
router.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);

export default router;
