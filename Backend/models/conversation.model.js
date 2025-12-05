import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }
    ],

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      }
    ],

    // Optional but recommended for chat list UI
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

/* --------------------------------------------------
   INDEXES (Correct & Optimized)
--------------------------------------------------- */

// 1️⃣ Ensure one conversation per pair of participants (any order)
conversationSchema.index(
  { participants: 1 },
  { unique: false }
);

// 2️⃣ Speed up $all queries
conversationSchema.index({ participants: 1, participants: -1 });

// 3️⃣ Query most recent chats faster
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
