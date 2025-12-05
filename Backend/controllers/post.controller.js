// controllers/post.controller.js
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketIds, io } from "../socket/socket.js";

/* -------------------------------------------
   ADD NEW POST
-------------------------------------------- */
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image required",
      });
    }

    // ✔ Optimize image
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    // ✔ Upload to Cloudinary
    const uploaded = await cloudinary.uploader.upload(fileUri);

    // ✔ Create post
    const post = await Post.create({
      caption: caption || "",
      image: uploaded.secure_url,
      author: authorId,
      comments: [],
      likes: [],
    });

    await User.findByIdAndUpdate(authorId, {
      $push: { posts: post._id },
    });

    await post.populate("author", "username profilePicture");

    return res.status(201).json({
      success: true,
      message: "New post added",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add post",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   GET ALL POSTS (FEED)
-------------------------------------------- */
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   GET LOGGED-IN USER POSTS
-------------------------------------------- */
export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;

    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username profilePicture" },
      });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   LIKE POST
-------------------------------------------- */
export const likePost = async (req, res) => {
  try {
    const likerId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });

    // Prevent duplicate likes
    if (!post.likes.includes(likerId)) {
      post.likes.push(likerId);
      await post.save();
    }

    const user = await User.findById(likerId).select(
      "username profilePicture"
    );

    const postOwnerId = post.author.toString();

    // Don’t notify yourself
    if (postOwnerId !== likerId.toString()) {
      const notification = {
        type: "like",
        userId: likerId,
        userDetails: user,
        postId,
        message: "liked your post",
      };

      const receivers = getReceiverSocketIds(postOwnerId);
      receivers.forEach((sockId) =>
        io.to(sockId).emit("notification", notification)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Post liked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to like post",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   DISLIKE POST
-------------------------------------------- */
export const dislikePost = async (req, res) => {
  try {
    const likerId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });

    post.likes = post.likes.filter(
      (id) => id.toString() !== likerId.toString()
    );

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post disliked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to dislike post",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   ADD COMMENT
-------------------------------------------- */
export const addComment = async (req, res) => {
  try {
    const commenterId = req.id;
    const postId = req.params.id;
    const { text } = req.body;

    if (!text || text.trim() === "")
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });

    const comment = await Comment.create({
      text,
      author: commenterId,
      post: postId,
    });

    await comment.populate("author", "username profilePicture");

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      success: true,
      message: "Comment added",
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   GET COMMENTS OF A POST
-------------------------------------------- */
export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture");

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   DELETE POST
-------------------------------------------- */
export const deletePost = async (req, res) => {
  try {
    const authorId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });

    if (post.author.toString() !== authorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    await User.findByIdAndUpdate(authorId, {
      $pull: { posts: postId },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

/* -------------------------------------------
   BOOKMARK POST
-------------------------------------------- */
export const bookmarkPost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const isBookmarked = user.bookmarks.includes(postId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== postId.toString()
      );
      await user.save();

      return res.status(200).json({
        success: true,
        type: "unsaved",
        message: "Post removed from bookmark",
      });
    }

    user.bookmarks.push(postId);
    await user.save();

    return res.status(200).json({
      success: true,
      type: "saved",
      message: "Post bookmarked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to bookmark post",
      error: error.message,
    });
  }
};
