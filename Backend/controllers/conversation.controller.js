// Backend/controllers/conversation.controller.js
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

/* --------------------------------------------------------
   GET ALL CONVERSATIONS FOR LOGGED-IN USER
   Returns conversations sorted by most recent message
-------------------------------------------------------- */
export const getConversations = async (req, res) => {
  try {
    const userId = req.id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "participants",
        select: "username profilePicture",
      })
      .populate({
        path: "lastMessage",
        select: "message createdAt senderId",
        populate: {
          path: "senderId",
          select: "username",
        },
      });

    // Format: include other user info + last message preview
    const formatted = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== userId.toString(),
      );

      return {
        _id: conv._id,
        otherUser: otherUser || null,
        lastMessage: conv.lastMessage
          ? {
              text: conv.lastMessage.message,
              createdAt: conv.lastMessage.createdAt,
              senderId: conv.lastMessage.senderId,
            }
          : null,
        updatedAt: conv.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/* --------------------------------------------------------
   GET UNREAD MESSAGE COUNT
-------------------------------------------------------- */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.id;

    const count = await Message.countDocuments({
      receiverId: userId,
      seen: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("UNREAD COUNT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

/* --------------------------------------------------------
   MARK MESSAGES AS SEEN
-------------------------------------------------------- */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const userId = req.id;
    const senderId = req.params.id;

    await Message.updateMany(
      {
        senderId,
        receiverId: userId,
        seen: false,
      },
      { seen: true },
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.error("MARK SEEN ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as seen",
    });
  }
};
