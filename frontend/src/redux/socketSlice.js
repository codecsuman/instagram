import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socketio",

  initialState: {
    socket: null,         
    onlineUsers: [],      
    isConnected: false,   
    socketId: null,       
    reconnectAttempts: 0, 
  },

  reducers: {
    // Save socket instance
    setSocket: (state, action) => {
      state.socket = action.payload || null;
    },

    // Online users
    setOnlineUsers: (state, action) => {
      state.onlineUsers = Array.isArray(action.payload) ? action.payload : [];
    },

    // Connection status
    setSocketConnected: (state, action) => {
      state.isConnected = Boolean(action.payload);
    },

    // Current socket ID
    setSocketId: (state, action) => {
      state.socketId = action.payload || null;
    },

    // Reconnection tracker
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },

    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },

    // LOGOUT → Reset socket state
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
