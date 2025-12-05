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
router.post("/register", register);   // matches frontend: api.post("/user/register")
router.post("/login", login);         // matches frontend: api.post("/user/login")
router.post("/logout", logout);       // matches frontend: api.post("/user/logout")

/* -----------------------------------
   PROFILE ROUTES
------------------------------------ */
router.get("/:id/profile", isAuthenticated, getProfile);
// frontend: api.get(`/user/${id}/profile`)

router.patch(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile
);
// frontend: api.patch("/user/profile/edit")

/* -----------------------------------
   SUGGESTED USERS
------------------------------------ */
router.get("/suggested", isAuthenticated, getSuggestedUsers);
// frontend: api.get("/user/suggested")

/* -----------------------------------
   FOLLOW / UNFOLLOW
------------------------------------ */
router.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);
// frontend: api.post(`/user/followorunfollow/${id}`)

export default router;
