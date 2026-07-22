import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

/* GET ALL NOTIFICATIONS */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePicture")
      .populate("post", "image")
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/* MARK ALL AS READ */
export const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.id;
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true },
    );
    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

/* MARK SINGLE AS READ */
export const markSingleAsRead = async (req, res) => {
  try {
    const userId = req.id;
    const notifId = req.params.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: notifId, recipient: userId },
      { read: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("MARK SINGLE READ ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

/* DELETE ALL NOTIFICATIONS */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.id;
    await Notification.deleteMany({ recipient: userId });
    return res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATIONS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};

/* HELPER: Create notification + emit socket */
export const createNotification = async ({
  io,
  recipientId,
  senderId,
  type,
  postId = null,
  messageText = "",
}) => {
  try {
    if (!recipientId || !senderId) return null;
    if (recipientId.toString() === senderId.toString()) return null;

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      message: messageText,
    });

    const populated = await Notification.findById(notification._id)
      .populate("sender", "username profilePicture")
      .populate("post", "image");

    const sender = await User.findById(senderId).select(
      "username profilePicture",
    );
    const socketPayload = {
      type,
      userId: senderId,
      userDetails: sender,
      postId,
      postImage: populated?.post?.image || null,
      message: messageText,
      _id: notification._id,
      createdAt: notification.createdAt,
      read: false,
    };

    io.to(recipientId.toString()).emit("notification", socketPayload);
    return populated;
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error.message);
    return null;
  }
};
