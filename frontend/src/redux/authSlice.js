import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  suggestedUsers: [],
  userProfile: null,
  selectedUserForProfile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // -----------------------------
    // Logged-in User
    // -----------------------------
    setAuthUser: (state, action) => {
      state.user = action.payload || null;
    },

    updateAuthUser: (state, action) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    // -----------------------------
    // Suggested Users
    // -----------------------------
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    // -----------------------------
    // Profile
    // -----------------------------
    setUserProfile: (state, action) => {
      state.userProfile = action.payload || null;
    },

    clearUserProfile: (state) => {
      state.userProfile = null;
    },

    // -----------------------------
    // Selected Profile (optional)
    // -----------------------------
    setSelectedUser: (state, action) => {
      state.selectedUserForProfile = action.payload || null;
    },

    clearSelectedUser: (state) => {
      state.selectedUserForProfile = null;
    },

    // -----------------------------
    // Logout
    // -----------------------------
    logoutUser: (state) => {
      state.user = null;
      state.userProfile = null;
      state.suggestedUsers = [];
      state.selectedUserForProfile = null;
    },
  },
});

export const {
  setAuthUser,
  updateAuthUser,
  logoutUser,
  setSuggestedUsers,
  setUserProfile,
  clearUserProfile,
  setSelectedUser,
  clearSelectedUser,
} = authSlice.actions;

export default authSlice.reducer;