import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  selectedChatUser: null,
  loading: false,
  error: null,
  hasMore: true,
};

const sortByTime = (arr) =>
  arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {

    // --------------------------
    // SET ALL MESSAGES
    // --------------------------
    setMessages: (state, action) => {
      const msgs = Array.isArray(action.payload) ? action.payload : [];
      state.messages = sortByTime(msgs);
    },

    // --------------------------
    // ADD SOCKET / NEW MESSAGE
    // --------------------------
    addMessage: (state, action) => {
      const msg = action.payload;
      if (!msg || !msg._id) return;

      const exists = state.messages.some((m) => m._id === msg._id);
      if (!exists) {
        state.messages.push(msg);
        sortByTime(state.messages);
      }
    },

    // --------------------------
    // WHEN USER SELECTS A CHAT
    // --------------------------
    setSelectedChatUser: (state, action) => {
      state.selectedChatUser = action.payload || null;
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.hasMore = true;
    },

    // --------------------------
    // LOADING / ERROR
    // --------------------------
    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },

    setError: (state, action) => {
      state.error = action.payload || null;
    },

    // --------------------------
    // LOAD OLD MESSAGES (PREPEND + NO DUPLICATES)
    // --------------------------
    appendOldMessages: (state, action) => {
      const older = Array.isArray(action.payload) ? action.payload : [];

      const existingIds = new Set(state.messages.map((m) => m._id));
      const filteredOld = older.filter((m) => !existingIds.has(m._id));

      state.messages = sortByTime([...filteredOld, ...state.messages]);
    },

    setHasMore: (state, action) => {
      state.hasMore = Boolean(action.payload);
    },

    // --------------------------
    // RESET CHAT (LOGOUT)
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
