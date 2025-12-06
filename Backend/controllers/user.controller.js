import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

/* -------------------- COOKIE SETTINGS (AUTO MODE) -------------------- */
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,           // true only on Render
  sameSite: isProduction ? "none" : "lax",  // production vs localhost
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

/* ------------------------ REGISTER ------------------------ */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      followers: [],
      following: [],
      bookmarks: [],
      posts: [],
      bio: "",
      gender: "",
      profilePicture: "",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while registering",
      error: error.message,
    });
  }
};

/* ------------------------- LOGIN ------------------------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    let user = await User.findOne({ email }).select("+password");

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    const userPosts = await Post.find({ author: user._id }).sort({
      createdAt: -1,
    });

    const formattedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      gender: user.gender,
      followers: user.followers,
      following: user.following,
      bookmarks: user.bookmarks,
      posts: userPosts,
    };

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: `Welcome back, ${user.username}`,
        user: formattedUser,
      });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

/* ------------------------- LOGOUT ------------------------- */
export const logout = async (_, res) => {
  try {
    return res
      .cookie("token", "", { ...cookieOptions, maxAge: 0 })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: error.message,
    });
  }
};

/* ------------------------- GET PROFILE ------------------------- */
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "bookmarks",
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
};

/* ------------------------- EDIT PROFILE ------------------------- */
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePhoto = req.file;

    let cloudResponse;

    if (profilePhoto) {
      const fileUri = getDataUri(profilePhoto);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (bio !== undefined) user.bio = bio;
    if (gender !== undefined) user.gender = gender;
    if (profilePhoto) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/* ------------------------- SUGGESTED USERS ------------------------- */
export const getSuggestedUsers = async (req, res) => {
  try {
    const authUserId = req.id;

    const users = await User.find({
      _id: { $ne: authUserId },
    }).select("username profilePicture bio followers following");

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load suggested users",
      error: error.message,
    });
  }
};

/* ------------------------- FOLLOW / UNFOLLOW ------------------------- */
export const followOrUnfollow = async (req, res) => {
  try {
    const followerId = req.id;
    const targetId = req.params.id;

    if (followerId === targetId)
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });

    const user = await User.findById(followerId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      user.following.pull(targetId);
      targetUser.followers.pull(followerId);
      await user.save();
      await targetUser.save();
      return res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
      });
    }

    user.following.push(targetId);
    targetUser.followers.push(followerId);
    await user.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: "Followed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to follow/unfollow",
      error: error.message,
    });
  }
};
