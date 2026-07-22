// Backend/controllers/message.controller.js
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { createNotification } from "./notification.controller.js";
import { io } from "../socket/socket.js";

/* --------------------------------------------------------
   SEND MESSAGE + REAL-TIME NOTIFICATION
-------------------------------------------------------- */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage } = req.body;

    if (!textMessage || !textMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver id is required",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: textMessage.trim(),
      conversationId: conversation._id,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = newMessage._id;
      await conversation.save();
    }

    // Socket: Send message in real-time
    io.to(receiverId.toString()).emit("newMessage", newMessage);

    // Create persistent notification
    await createNotification({
      io,
      recipientId: receiverId,
      senderId,
      type: "message",
      messageText: "sent you a message",
    });

    console.log(`📢 Message notification sent to user ${receiverId}`);

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/* --------------------------------------------------------
   GET ALL MESSAGES
-------------------------------------------------------- */
export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages || [],
    });
  } catch (error) {
    console.error("GET MESSAGE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};
