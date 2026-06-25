import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  socket: null,
  onlineUsers: [],
  isConnected: false,
  socketId: null,
  reconnectAttempts: 0,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = Array.isArray(action.payload) ? action.payload : [];
    },

    setSocketConnected: (state, action) => {
      state.isConnected = Boolean(action.payload);
    },

    setSocketId: (state, action) => {
      state.socketId = action.payload || null;
    },

    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },

    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },

    clearOnlineUsers: (state) => {
      state.socket = null;
      state.onlineUsers = [];
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