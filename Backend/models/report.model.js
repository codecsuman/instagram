// Backend/models/report.model.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  postAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    default: "Inappropriate content",
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Report = mongoose.model("Report", reportSchema);
