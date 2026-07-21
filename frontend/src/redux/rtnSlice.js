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

      const uniqueKey = `${noti.type}-${noti.userId}-${noti.postId || ""}-${Date.now()}`;

      const alreadyExist = state.notifications.some(
        (item) =>
          item.userId === noti.userId &&
          item.type === noti.type &&
          item.postId === noti.postId,
      );

      // ADD notification
      if (
        ["like", "comment", "follow", "message", "post"].includes(noti.type)
      ) {
        if (!alreadyExist) {
          state.notifications.unshift({
            ...noti,
            uniqueKey,
            createdAt: Date.now(),
          });
          state.unreadCount += 1;
        }
      }

      // REMOVE notification (for dislike)
      if (["dislike"].includes(noti.type)) {
        const before = state.notifications.length;
        state.notifications = state.notifications.filter(
          (item) =>
            !(
              item.userId === noti.userId &&
              item.type === "like" &&
              item.postId === noti.postId
            ),
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

export const { setLikeNotification, markAllRead, clearNotifications } =
  rtnSlice.actions;

export default rtnSlice.reducer;
