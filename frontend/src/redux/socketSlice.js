import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socketio",

  initialState: {
    socket: null,          // ← actual socket instance
    onlineUsers: [],       // ← online users from server
    isConnected: false,    // ← socket connected flag
    socketId: null,        // ← current socket ID
    reconnectAttempts: 0,  // ← track reconnect tries (optional)
  },

  reducers: {
    // Save socket instance
    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    // Online users list
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },

    // Connected or disconnected
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },

    // Save socket ID
    setSocketId: (state, action) => {
      state.socketId = action.payload;
    },

    // Increase reconnect attempts
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },

    // Reset reconnect attempts
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },

    // LOGOUT → Reset everything
    clearOnlineUsers: (state) => {
      state.onlineUsers = [];
      state.socket = null;
      state.isConnected = false;
      state.socketId = null;
      state.reconnectAttempts = 0;
    },
  },
});

export const {
  setSocket,
  setOnlineUsers,
  setSocketConnected,
  setSocketId,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  clearOnlineUsers,
} = socketSlice.actions;

export default socketSlice.reducer;
