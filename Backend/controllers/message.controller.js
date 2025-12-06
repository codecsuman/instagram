// message.controller.js
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketIds, io } from "../socket/socket.js";

/* --------------------------------------------------------
   SEND MESSAGE
-------------------------------------------------------- */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage } = req.body;

    if (!textMessage || textMessage.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // ✅ FIND OR CREATE CONVERSATION
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // ✅ CREATE MESSAGE WITH conversationId FIXED
    let newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message: textMessage,
    });

    // ✅ POPULATE SENDER DETAILS
    newMessage = await newMessage.populate(
      "senderId",
      "username profilePicture"
    );

    // ✅ SAVE MESSAGE INTO CONVERSATION
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // ✅ SEND VIA SOCKET TO RECEIVER
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("newMessage", newMessage);
    });

    // ✅ ALSO SEND TO SENDER (MULTI DEVICE SYNC)
    const senderSockets = getReceiverSocketIds(senderId);
    senderSockets.forEach((sockId) => {
      io.to(sockId).emit("newMessage", newMessage);
    });

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log("SEND MESSAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
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
    }).populate({
      path: "messages",
      options: { sort: { createdAt: 1 } },
      populate: { path: "senderId", select: "username profilePicture" },
    });

    return res.status(200).json({
      success: true,
      messages: conversation ? conversation.messages : [],
    });
  } catch (error) {
    console.log("GET MESSAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};
