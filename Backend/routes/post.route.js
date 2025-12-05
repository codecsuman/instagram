import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  dislikePost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

/* ---------------------- ADD POST ---------------------- */
// matches: api.post("/post/addpost")
router.post("/addpost", isAuthenticated, upload.single("image"), addNewPost);

/* ---------------------- FEED POSTS ---------------------- */
// matches: api.get("/post/all")
router.get("/all", isAuthenticated, getAllPost);

/* ---------------------- USER POSTS ---------------------- */
// matches: api.get("/post/userpost/all")
router.get("/userpost/all", isAuthenticated, getUserPost);

/* ---------------------- LIKE / DISLIKE ---------------------- */
// matches: api.get(`/post/${id}/like`)
router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);

/* ---------------------- COMMENT ---------------------- */
// matches: api.post(`/post/${id}/comment`)
router.post("/:id/comment", isAuthenticated, addComment);
router.get("/:id/comment/all", isAuthenticated, getCommentsOfPost);

/* ---------------------- DELETE POST ---------------------- */
// matches: api.delete(`/post/delete/${id}`)
router.delete("/delete/:id", isAuthenticated, deletePost);

/* ---------------------- BOOKMARK ---------------------- */
// matches: api.get(`/post/${id}/bookmark`)
router.get("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;
