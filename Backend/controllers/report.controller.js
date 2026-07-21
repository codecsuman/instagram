// Backend/controllers/report.controller.js
import { Report } from "../models/report.model.js";
import { Post } from "../models/post.model.js";

/* --------------------------------------------------------
   REPORT A POST
-------------------------------------------------------- */
export const reportPost = async (req, res) => {
  try {
    const reporterId = req.id;
    const postId = req.params.id;
    const { reason } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if already reported
    const existingReport = await Report.findOne({
      reporter: reporterId,
      post: postId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this post",
      });
    }

    await Report.create({
      reporter: reporterId,
      post: postId,
      postAuthor: post.author,
      reason: reason || "Inappropriate content",
    });

    return res.status(201).json({
      success: true,
      message: "Post reported successfully",
    });
  } catch (error) {
    console.error("REPORT POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to report post",
    });
  }
};
