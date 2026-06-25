// Backend/routes/user.route.js
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

const router = express.Router();

/* -----------------------------------
   AUTH ROUTES
------------------------------------ */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

/* -----------------------------------
   SUGGESTED USERS
------------------------------------ */
router.get("/suggested", isAuthenticated, getSuggestedUsers);

/* -----------------------------------
   PROFILE ROUTES
------------------------------------ */
router.get("/:id/profile", isAuthenticated, getProfile);

router.patch(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile
);

/* -----------------------------------
   FOLLOW / UNFOLLOW
------------------------------------ */
router.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);

export default router;