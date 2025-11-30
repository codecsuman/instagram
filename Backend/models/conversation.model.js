import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  }]
}, { timestamps: true });


// ✅ Ensure exactly two users
conversationSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    return next(new Error("Conversation must have two participants"));
  }
  next();
});


// ✅ Correct unique constraint for pair of users
conversationSchema.index(
  { "participants.0": 1, "participants.1": 1 },
  { unique: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
