import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* -------------------------------------------------
   INDEXES FOR MAXIMUM SPEED
--------------------------------------------------- */

// Faster DM lookups
messageSchema.index({ conversationId: 1 });

// Faster sender → receiver message lists
messageSchema.index({ senderId: 1, receiverId: 1 });

// Fast unseen message queries
messageSchema.index({ receiverId: 1, seen: 1 });

// Sort latest messages fast
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
