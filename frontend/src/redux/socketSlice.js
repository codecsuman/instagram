import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",

  initialState: {
    onlineUsers: [],
    isConnected: false,
    socketId: null,
  },

  reducers: {
    // Online users from backend
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },

    // Connection status
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },

    // Current socket id
    setSocketId: (state, action) => {
      state.socketId = action.payload;
    },

    // Reset on logout
    clearOnlineUsers: (state) => {
      state.onlineUsers = [];
      state.isConnected = false;
      state.socketId = null;
    },
  },
});

export const {
  setOnlineUsers,
  setSocketConnected,
  setSocketId,
  clearOnlineUsers,
} = socketSlice.actions;

export default socketSlice.reducer;
