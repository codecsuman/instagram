import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: "",
      maxlength: 2200, // Instagram limit
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      }
    ],
  },
  {
    timestamps: true,
  }
);

/* --------------------------------------
   ⚡ Indexes for SPEED
--------------------------------------- */

// Fast find posts by user
postSchema.index({ author: 1 });

// Fast sorting for feed
postSchema.index({ createdAt: -1 });

// Fast like queries
postSchema.index({ likes: 1 });

// Fast comment lookup
postSchema.index({ comments: 1 });

// Fast caption search
postSchema.index({ caption: "text" });

export const Post = mongoose.model("Post", postSchema);
