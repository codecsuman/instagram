import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  dislikePost,
  editPost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

/* ---------------------- ADD POST ---------------------- */
router.post("/addpost", isAuthenticated, upload.single("image"), addNewPost);

/* ---------------------- FEED POSTS ---------------------- */
router.get("/all", isAuthenticated, getAllPost);

/* ---------------------- USER POSTS ---------------------- */
router.get("/userpost/all", isAuthenticated, getUserPost);

/* ---------------------- LIKE / DISLIKE ---------------------- */
router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);

/* ---------------------- COMMENT ---------------------- */
router.post("/:id/comment", isAuthenticated, addComment);
router.get("/:id/comment/all", isAuthenticated, getCommentsOfPost);

/* ---------------------- EDIT POST ---------------------- */
router.patch("/edit/:id", isAuthenticated, editPost);

/* ---------------------- DELETE POST ---------------------- */
router.delete("/delete/:id", isAuthenticated, deletePost);

/* ---------------------- BOOKMARK ---------------------- */
router.get("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;
