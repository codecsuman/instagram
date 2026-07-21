// Backend/controllers/post.controller.js
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { io } from "../socket/socket.js";

/* -------------------------------------------
   ADD NEW POST + FOLLOWER NOTIFICATION
-------------------------------------------- */
export const addNewPost = async (req, res) => {
  try {
    const { caption = "" } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image || !image.buffer) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 1080,
        height: 1080,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(fileUri, {
      folder: "instagram_clone/posts",
    });

    const post = await Post.create({
      caption: caption.trim(),
      image: uploaded.secure_url,
      author: authorId,
      comments: [],
      likes: [],
    });

    await User.findByIdAndUpdate(authorId, {
      $push: { posts: post._id },
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    // 🆕 Notify all followers that this user posted a new photo
    const author = await User.findById(authorId).select(
      "username profilePicture followers",
    );

    if (author?.followers?.length > 0) {
      const notification = {
        type: "post",
        userId: authorId,
        userDetails: {
          username: author.username,
          profilePicture: author.profilePicture,
        },
        postId: post._id,
        postImage: post.image,
        message: "posted a new photo",
      };

      author.followers.forEach((followerId) => {
        io.to(followerId.toString()).emit("notification", notification);
      });

      console.log(
        `📢 New post notification sent to ${author.followers.length} followers`,
      );
    }

    return res.status(201).json({
      success: true,
      message: "New post added successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("ADD POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to add post",
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
    console.error("GET ALL POSTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
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
    console.error("GET USER POSTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
    });
  }
};

/* -------------------------------------------
   LIKE POST + NOTIFICATION
-------------------------------------------- */
export const likePost = async (req, res) => {
  try {
    const likerId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === likerId.toString(),
    );

    if (!alreadyLiked) {
      post.likes.push(likerId);
      await post.save();
    }

    const user = await User.findById(likerId).select("username profilePicture");
    const postOwnerId = post.author.toString();

    if (postOwnerId !== likerId.toString()) {
      const notification = {
        type: "like",
        userId: likerId,
        userDetails: user,
        postId,
        message: "liked your post",
      };

      io.to(postOwnerId).emit("notification", notification);
      console.log(`📢 Like notification sent to user ${postOwnerId}`);
    }

    return res.status(200).json({
      success: true,
      message: "Post liked",
    });
  } catch (error) {
    console.error("LIKE POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to like post",
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
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.likes = post.likes.filter(
      (id) => id.toString() !== likerId.toString(),
    );

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post disliked",
    });
  } catch (error) {
    console.error("DISLIKE POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to dislike post",
    });
  }
};

/* -------------------------------------------
   ADD COMMENT + NOTIFICATION + LIVE BROADCAST
-------------------------------------------- */
export const addComment = async (req, res) => {
  try {
    const commenterId = req.id;
    const postId = req.params.id;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      text: text.trim(),
      author: commenterId,
      post: postId,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "username profilePicture",
    );

    post.comments.push(comment._id);
    await post.save();

    const commenter = await User.findById(commenterId).select(
      "username profilePicture",
    );
    const postOwnerId = post.author.toString();

    if (postOwnerId !== commenterId.toString()) {
      const notification = {
        type: "comment",
        userId: commenterId,
        userDetails: commenter,
        postId,
        message: "commented on your post",
      };

      io.to(postOwnerId).emit("notification", notification);
      console.log(`📢 Comment notification sent to user ${postOwnerId}`);
    }

    // 🆕 Broadcast new comment to everyone viewing the feed (live update)
    io.emit("newComment", {
      postId,
      comment: populatedComment,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
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
    console.error("GET COMMENTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
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
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== authorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this post",
      });
    }

    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    await User.findByIdAndUpdate(authorId, {
      $pull: { posts: postId },
      $pullAll: { bookmarks: [postId] },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

/* -------------------------------------------
   EDIT POST CAPTION
-------------------------------------------- */
export const editPost = async (req, res) => {
  try {
    const authorId = req.id;
    const postId = req.params.id;
    const { caption } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== authorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this post",
      });
    }

    post.caption = caption?.trim() || "";
    await post.save();

    const updatedPost = await Post.findById(post._id)
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
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("EDIT POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to edit post",
    });
  }
};

/* -------------------------------------------
   BOOKMARK / UNBOOKMARK POST
-------------------------------------------- */
export const bookmarkPost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === postId.toString(),
    );

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== postId.toString(),
      );
      await user.save();

      return res.status(200).json({
        success: true,
        type: "unsaved",
        message: "Post removed from bookmarks",
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
    console.error("BOOKMARK POST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to bookmark post",
    });
  }
};
