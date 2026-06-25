// Backend/controllers/message.controller.js
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketIds, io } from "../socket/socket.js";

/* --------------------------------------------------------
   SEND MESSAGE (SAVE + REAL-TIME)
-------------------------------------------------------- */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver id is required",
      });
    }

    if (!textMessage?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const cleanMessage = textMessage.trim();

    // -----------------------------------------
    // FIND OR CREATE CONVERSATION
    // -----------------------------------------
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // -----------------------------------------
    // CREATE MESSAGE
    // IMPORTANT: conversationId added here
    // -----------------------------------------
    let newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message: cleanMessage,
    });

    // populate sender info for frontend UI
    newMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "username profilePicture"
    );

    // -----------------------------------------
    // SAVE MESSAGE IN CONVERSATION
    // -----------------------------------------
    conversation.messages.push(newMessage._id);
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // -----------------------------------------
    // SOCKET.IO REAL-TIME EMIT
    // -----------------------------------------

    // send to receiver (all devices)
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("newMessage", newMessage);
    });

    // also send to sender's own active devices so chat updates instantly
    const senderSockets = getReceiverSocketIds(senderId);
    senderSockets.forEach((sockId) => {
      io.to(sockId).emit("newMessage", newMessage);
    });

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* --------------------------------------------------------
   GET ALL MESSAGES BETWEEN TWO USERS
-------------------------------------------------------- */
export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver id is required",
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      options: { sort: { createdAt: 1 } },
      populate: {
        path: "senderId",
        select: "username profilePicture",
      },
    });

    return res.status(200).json({
      success: true,
      messages: conversation ? conversation.messages : [],
    });
  } catch (error) {
    console.error("GET MESSAGE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};