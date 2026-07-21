// Backend/controllers/explore.controller.js
import { Post } from "../models/post.model.js";

/* --------------------------------------------------------
   GET EXPLORE / TRENDING POSTS
   - Posts with most likes + comments
   - Mix of recent and popular
-------------------------------------------------------- */
export const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 }, limit: 2 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    // Add engagement score for sorting (likes + comments count)
    const enrichedPosts = posts.map((post) => ({
      ...post.toObject(),
      engagementScore:
        (post.likes?.length || 0) + (post.comments?.length || 0) * 2,
    }));

    // Sort by engagement score descending
    enrichedPosts.sort((a, b) => b.engagementScore - a.engagementScore);

    const total = await Post.countDocuments();

    return res.status(200).json({
      success: true,
      posts: enrichedPosts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error("EXPLORE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch explore posts",
    });
  }
};
