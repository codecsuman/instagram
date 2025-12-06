import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    // Optional but recommended for chat UI
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

/* --------------------------------------------------
   ✅ INDEXES (CLEAN & PRODUCTION READY)
--------------------------------------------------- */

// ✅ Efficient $all queries
conversationSchema.index({ participants: 1 });

// ✅ Faster chat list ordering
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
