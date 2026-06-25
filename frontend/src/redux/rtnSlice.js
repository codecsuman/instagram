import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState,

  reducers: {
    setLikeNotification: (state, action) => {
      const noti = action.payload;
      if (!noti) return;

      const uniqueKey = `${noti.type}-${noti.userId}-${noti.postId || ""}`;

      const alreadyExist = state.notifications.some(
        (item) => item.uniqueKey === uniqueKey
      );

      // ADD notification
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

      // REMOVE notification
      if (["dislike", "comment_removed"].includes(noti.type)) {
        const before = state.notifications.length;

        state.notifications = state.notifications.filter(
          (item) => item.uniqueKey !== uniqueKey
        );

        const after = state.notifications.length;

        if (after < before && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      }
    },

    markAllRead: (state) => {
      state.unreadCount = 0;
    },

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