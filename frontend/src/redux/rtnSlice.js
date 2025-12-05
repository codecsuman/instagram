import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",

  initialState: {
    notifications: [],
    unreadCount: 0,
  },

  reducers: {
    // ---------------------------------------------------
    // HANDLE ALL SOCKET NOTIFICATIONS
    // ---------------------------------------------------
    setLikeNotification: (state, action) => {
      const noti = action.payload;
      if (!noti || !noti.type) return;

      const uniqueKey = `${noti.type}-${noti.userId}-${noti.postId}`;

      const exists = state.notifications.some(
        (item) => item.uniqueKey === uniqueKey
      );

      // ---------------------------------------------------
      // ADD NOTIFICATIONS
      // ---------------------------------------------------
      if (["like", "comment"].includes(noti.type)) {
        if (!exists) {
          state.notifications.unshift({
            ...noti,
            uniqueKey,
            createdAt: Date.now(),
          });

          state.unreadCount = Math.max(state.unreadCount + 1, 0);
        }
      }

      // ---------------------------------------------------
      // REMOVE NOTIFICATIONS
      // ---------------------------------------------------
      if (["dislike", "comment_removed"].includes(noti.type)) {
        const before = state.notifications.length;

        state.notifications = state.notifications.filter(
          (n) => n.uniqueKey !== uniqueKey
        );

        const after = state.notifications.length;

        if (after < before) {
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
      }
    },

    // ---------------------------------------------------
    // MARK ALL AS READ
    // ---------------------------------------------------
    markAllRead: (state) => {
      state.unreadCount = 0;
    },

    // ---------------------------------------------------
    // CLEAR ALL NOTIFICATIONS
    // ---------------------------------------------------
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
