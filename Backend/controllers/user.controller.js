import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";
import { io } from "../socket/socket.js";

const isProduction = process.env.NODE_ENV === "production";

// --------------------------------------------------
// COOKIE OPTIONS
// --------------------------------------------------
const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});

// --------------------------------------------------
// CREATE TOKEN
// --------------------------------------------------
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
};

// --------------------------------------------------
// SANITIZE USER RESPONSE
// --------------------------------------------------
const buildUserResponse = (user, posts = []) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture || "",
  bio: user.bio || "",
  gender: user.gender || "other",
  followers: user.followers || [],
  following: user.following || [],
  bookmarks: user.bookmarks || [],
  posts,
});

// --------------------------------------------------
// REGISTER
// --------------------------------------------------
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "Email already in use"
            : "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      followers: [],
      following: [],
      bookmarks: [],
      posts: [],
      bio: "",
      gender: "other",
      profilePicture: "",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while registering",
    });
  }
};

// --------------------------------------------------
// LOGIN
// --------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const token = generateToken(user._id);

    const userPosts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture");

    const formattedUser = buildUserResponse(user, userPosts);

    return res
      .status(200)
      .cookie("token", token, getCookieOptions())
      .json({
        success: true,
        message: `Welcome back, ${user.username}`,
        user: formattedUser,
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        ...getCookieOptions(),
        maxAge: 0,
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("LOGOUT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// --------------------------------------------------
// GET PROFILE
// --------------------------------------------------
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      })
      .populate({
        path: "bookmarks",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🆕 MIGRATE OLD POSTS ON-THE-FLY: Convert image → images for response
    const migratePosts = (posts) => {
      if (!Array.isArray(posts)) return [];
      return posts.map((post) => {
        const postObj = post.toObject ? post.toObject() : post;

        // If old post has 'image' but no 'images', convert it
        if (postObj.image && (!postObj.images || postObj.images.length === 0)) {
          postObj.images = [postObj.image];
        }
        // If no images at all, set empty array
        if (!postObj.images) {
          postObj.images = [];
        }

        return postObj;
      });
    };

    const responseUser = {
      ...user.toObject(),
      posts: migratePosts(user.posts),
      bookmarks: migratePosts(user.bookmarks),
    };

    return res.status(200).json({
      success: true,
      user: responseUser,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};
// --------------------------------------------------
// EDIT PROFILE
// --------------------------------------------------
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (typeof bio !== "undefined") {
      user.bio = bio.trim();
    }

    if (
      typeof gender !== "undefined" &&
      gender !== "" &&
      ["male", "female", "other"].includes(gender)
    ) {
      user.gender = gender;
    }

    if (profilePhoto) {
      const fileUri = getDataUri(profilePhoto);

      if (!fileUri) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file",
        });
      }

      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: "instagram_clone/profile_pictures",
      });

      user.profilePicture = uploadResponse.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("EDIT PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// --------------------------------------------------
// GET SUGGESTED USERS
// --------------------------------------------------
export const getSuggestedUsers = async (req, res) => {
  try {
    const authUserId = req.id;

    const users = await User.find({
      _id: { $ne: authUserId },
    })
      .select("username profilePicture bio followers following")
      .limit(10);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SUGGESTED USERS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load suggested users",
    });
  }
};

// --------------------------------------------------
// FOLLOW / UNFOLLOW + REAL-TIME NOTIFICATION
// --------------------------------------------------
export const followOrUnfollow = async (req, res) => {
  try {
    const followerId = req.id;
    const targetId = req.params.id;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: "Target user id is required",
      });
    }

    if (String(followerId) === String(targetId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(followerId),
      User.findById(targetId),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => String(id) === String(targetId),
    );

    let action = "";

    if (isFollowing) {
      currentUser.following.pull(targetId);
      targetUser.followers.pull(followerId);
      action = "unfollow";
    } else {
      currentUser.following.addToSet(targetId);
      targetUser.followers.addToSet(followerId);
      action = "follow";
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    const postPopulateOptions = {
      path: "posts",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "author",
        select: "username profilePicture",
      },
    };

    await Promise.all([
      currentUser.populate(postPopulateOptions),
      targetUser.populate(postPopulateOptions),
    ]);

    // Real-time follow notification (only on follow, not unfollow)
    if (action === "follow") {
      await createNotification({
        io,
        recipientId: targetId,
        senderId: followerId,
        type: "follow",
        messageText: "started following you",
      });
    }

    return res.status(200).json({
      success: true,
      action,
      message:
        action === "follow"
          ? "Followed successfully"
          : "Unfollowed successfully",
      currentUser,
      targetUser,
    });
  } catch (error) {
    console.error("FOLLOW/UNFOLLOW ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to follow/unfollow user",
    });
  }
};
