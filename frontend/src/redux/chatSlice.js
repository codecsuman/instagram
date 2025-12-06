import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  selectedChatUser: null,
  loading: false,
  error: null,
  hasMore: true,     // For infinite scrolling
};

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    // --------------------------
    // SET ALL MESSAGES
    // --------------------------
    setMessages: (state, action) => {
      const msgs = Array.isArray(action.payload) ? action.payload : [];
      
      // Sort by createdAt (just to be safe)
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.messages = msgs;
    },

    // --------------------------
    // ADD SOCKET / NEW MESSAGE
    // --------------------------
    addMessage: (state, action) => {
      const msg = action.payload;

      if (!msg || !msg._id) return;

      // Prevent duplicates (socket + API)
      const exists = state.messages.some((m) => m._id === msg._id);

      if (!exists) {
        state.messages.push(msg);

        // auto sort (optional)
        state.messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    },

    // --------------------------
    // WHEN USER SELECTS A CHAT
    // --------------------------
    setSelectedChatUser: (state, action) => {
      state.selectedChatUser = action.payload || null;
      state.messages = []; // reset messages for new chat
      state.loading = false;
      state.error = null;
      state.hasMore = true;
    },

    // --------------------------
    // LOADING / ERROR
    // --------------------------
    setLoading: (state, action) => {
      state.loading = action.payload || false;
    },

    setError: (state, action) => {
      state.error = action.payload || null;
    },

    // --------------------------
    // LOAD OLD MESSAGES (prepend)
    // --------------------------
    appendOldMessages: (state, action) => {
      const older = Array.isArray(action.payload) ? action.payload : [];

      state.messages = [...older, ...state.messages];
    },

    setHasMore: (state, action) => {
      state.hasMore = Boolean(action.payload);
    },

    // --------------------------
    // RESET CHAT (logout)
    // --------------------------
    resetChat: (state) => {
      state.messages = [];
      state.selectedChatUser = null;
      state.loading = false;
      state.error = null;
      state.hasMore = true;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setSelectedChatUser,
  setLoading,
  setError,
  appendOldMessages,
  setHasMore,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
