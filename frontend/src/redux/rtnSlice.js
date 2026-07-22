import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState,

  reducers: {
    // --------------------------
    // SET NOTIFICATIONS (from API)
    // --------------------------
    setNotifications: (state, action) => {
      const notis = Array.isArray(action.payload) ? action.payload : [];
      state.notifications = notis.map((n) => ({
        ...n,
        uniqueKey:
          n._id || `${n.type}-${n.userId}-${Date.now()}-${Math.random()}`,
      }));
    },

    // --------------------------
    // ADD SINGLE NOTIFICATION (from socket)
    // --------------------------
    setLikeNotification: (state, action) => {
      const noti = action.payload;
      if (!noti) return;

      // Prevent duplicates by _id
      const alreadyExist = state.notifications.some(
        (item) => item._id && item._id === noti._id,
      );

      if (!alreadyExist) {
        state.notifications.unshift({
          ...noti,
          uniqueKey:
            noti._id ||
            `${noti.type}-${noti.userId}-${Date.now()}-${Math.random()}`,
          createdAt: noti.createdAt || Date.now(),
        });
        state.unreadCount += 1;
      }
    },

    // --------------------------
    // MARK ALL AS READ
    // --------------------------
    markAllRead: (state) => {
      state.unreadCount = 0;
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
    },

    // --------------------------
    // CLEAR ALL
    // --------------------------
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // --------------------------
    // SET UNREAD COUNT ONLY
    // --------------------------
    setUnreadCount: (state, action) => {
      state.unreadCount = Number(action.payload) || 0;
    },

    // --------------------------
    // SET LOADING
    // --------------------------
    setNotificationsLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
  },
});

export const {
  setNotifications,
  setLikeNotification,
  markAllRead,
  clearNotifications,
  setUnreadCount,
  setNotificationsLoading,
} = rtnSlice.actions;

export default rtnSlice.reducer;
