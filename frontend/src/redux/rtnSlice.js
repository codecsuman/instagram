import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",

  initialState: {
    notifications: [],   // all notifications
    unreadCount: 0,      // unread badge
  },

  reducers: {
    // ---------------------------------------------------
    // HANDLE ALL SOCKET NOTIFICATION TYPES
    // ---------------------------------------------------
    setLikeNotification: (state, action) => {
      const noti = action.payload;
      if (!noti) return;

      // Unique key ensures no duplicates
      const uniqueKey = `${noti.type}-${noti.userId}-${noti.postId}`;

      const alreadyExist = state.notifications.some(
        (item) => item.uniqueKey === uniqueKey
      );

      // ---------------------------------------------------
      // ADD NOTIFICATIONS (like/comment)
      // ---------------------------------------------------
      if (["like", "comment"].includes(noti.type)) {
        if (!alreadyExist) {
          state.notifications.unshift({
            ...noti,
            uniqueKey,
            createdAt: Date.now(),
          });
          state.unreadCount += 1;
        }
      }

      // ---------------------------------------------------
      // REMOVE NOTIFICATIONS (dislike/comment_removed)
      // ---------------------------------------------------
      if (["dislike", "comment_removed"].includes(noti.type)) {
        const before = state.notifications.length;

        state.notifications = state.notifications.filter(
          (i) => i.uniqueKey !== uniqueKey
        );

        const after = state.notifications.length;

        // reduce unread count safely
        if (after < before && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      }
    },

    // Mark all notifications as read
    markAllRead: (state) => {
      state.unreadCount = 0;
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setLikeNotification,
  markAllRead,
  clearNotifications,
} = rtnSlice.actions;

export default rtnSlice.reducer;
