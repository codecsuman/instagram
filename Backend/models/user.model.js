import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔒 never expose password
    },

    profilePicture: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 250, // Instagram-like
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      }
    ],

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      }
    ],
  },
  {
    timestamps: true,
  }
);

/* --------------------------------------
   ⚡ Indexes for PERFORMANCE
--------------------------------------- */

// Fast user lookup
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Fast follow system
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

// Fast bookmarks
userSchema.index({ bookmarks: 1 });

// Fast user posts
userSchema.index({ posts: 1 });

// Search by username + bio
userSchema.index({ username: "text", bio: "text" });

export const User = mongoose.model("User", userSchema);
