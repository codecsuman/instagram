// Backend/controllers/search.controller.js
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

/* --------------------------------------------------------
   SEARCH USERS & POSTS
   Query param: ?q=searchTerm
-------------------------------------------------------- */
export const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.id;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        users: [],
        posts: [],
      });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, "i");

    // Search users by username or bio
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [{ username: { $regex: regex } }, { bio: { $regex: regex } }],
        },
      ],
    })
      .select("username profilePicture bio followers following")
      .limit(20);

    // Search posts by caption
    const posts = await Post.find({
      caption: { $regex: regex },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 }, limit: 2 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    return res.status(200).json({
      success: true,
      users,
      posts,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

/* --------------------------------------------------------
   SEARCH USERS ONLY
-------------------------------------------------------- */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.id;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const regex = new RegExp(q.trim(), "i");

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [{ username: { $regex: regex } }, { bio: { $regex: regex } }],
        },
      ],
    })
      .select("username profilePicture bio followers following")
      .limit(20);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};
