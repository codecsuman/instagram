
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";

/* ===================== ADD POST ===================== */
export const addNewPost = async (req, res) => {
  try {
    const { caption = "" } = req.body;
    const file = req.file;
    const authorId = req.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    // ✅ Resize + compress
    const optimized = await sharp(file.buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 70 })
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${optimized.toString("base64")}`;

    // ✅ Upload to cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "posts",
      resource_type: "image"
    });

    if (!uploadResult?.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed"
      });
    }

    // ✅ Create post
    const post = await Post.create({
      caption,
      image: uploadResult.secure_url,
      author: authorId
    });

    // ✅ Update user posts
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate("author", "username profilePicture");

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post
    });

  } catch (error) {
    console.error("🔥 ADD POST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/* ===================== GET ALL POSTS ===================== */
export const getAllPost = async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("author", "username profilePicture")
    .populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: { path: "author", select: "username profilePicture" }
    });

  res.status(200).json({ success: true, posts });
};


/* ===================== GET USER POSTS ===================== */
export const getUserPost = async (req, res) => {
  const posts = await Post.find({ author: req.id })
    .sort({ createdAt: -1 })
    .populate("author", "username profilePicture")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username profilePicture" }
    });

  res.status(200).json({ success: true, posts });
};


/* ===================== LIKE POST ===================== */
export const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false });

  if (post.likes.includes(req.id)) {
    return res.status(400).json({
      success: false,
      message: "Already liked"
    });
  }

  post.likes.push(req.id);
  await post.save();

  const user = await User.findById(req.id).select("username profilePicture");

  // ✅ Send realtime notification
  if (post.author.toString() !== req.id) {
    const socketId = getReceiverSocketId(post.author.toString());
    const io = getIO();
    io?.to(socketId)?.emit("notification", {
      type: "like",
      userId: req.id,
      userDetails: user,
      postId: post._id
    });
  }

  return res.json({
    success: true,
    likes: post.likes
  });
};


/* ===================== DISLIKE POST ===================== */
export const dislikePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false });

  post.likes = post.likes.filter(id => id.toString() !== req.id);
  await post.save();

  return res.json({
    success: true,
    likes: post.likes
  });
};


/* ===================== ADD COMMENT ===================== */
export const addComment = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false });

  const comment = await Comment.create({
    text: req.body.text,
    author: req.id,
    post: post._id
  });

  await comment.populate("author", "username profilePicture");

  post.comments.push(comment._id);
  await post.save();

  return res.status(201).json({
    success: true,
    comment,
    comments: post.comments
  });
};


/* ===================== GET COMMENTS ===================== */
export const getCommentsOfPost = async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate("author", "username profilePicture");

  res.json({ success: true, comments });
};


/* ===================== DELETE POST ===================== */
export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false });

  if (post.author.toString() !== req.id) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized"
    });
  }

  await Post.deleteOne({ _id: post._id });
  await Comment.deleteMany({ post: post._id });

  const user = await User.findById(req.id);
  user.posts = user.posts.filter(id => id.toString() !== post._id.toString());
  await user.save();

  res.json({
    success: true,
    message: "Post deleted"
  });
};


/* ===================== BOOKMARK ===================== */
export const bookmarkPost = async (req, res) => {
  const user = await User.findById(req.id);

  if (user.bookmarks.includes(req.params.id)) {
    user.bookmarks.pull(req.params.id);
    await user.save();
    return res.json({ success: true, type: "unsaved" });
  }

  user.bookmarks.push(req.params.id);
  await user.save();

  return res.json({ success: true, type: "saved" });
};
