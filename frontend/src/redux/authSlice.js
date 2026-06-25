import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  suggestedUsers: [],
  userProfile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // --------------------------------------
    // SET LOGGED-IN USER
    // --------------------------------------
    setAuthUser: (state, action) => {
      state.user = action.payload || null;
    },

    // --------------------------------------
    // LOGOUT / RESET AUTH STATE
    // --------------------------------------
    logoutUser: (state) => {
      state.user = null;
      state.suggestedUsers = [];
      state.userProfile = null;
    },

    // --------------------------------------
    // SET SUGGESTED USERS
    // --------------------------------------
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    // --------------------------------------
    // SET CURRENT PROFILE PAGE USER
    // --------------------------------------
    setUserProfile: (state, action) => {
      state.userProfile = action.payload || null;
    },

    // --------------------------------------
    // UPDATE LOGGED-IN USER PARTIALLY
    // useful after edit profile / follow count update
    // --------------------------------------
    updateAuthUser: (state, action) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    // --------------------------------------
    // RESET ONLY PROFILE PAGE DATA
    // useful when leaving profile / loading another profile
    // --------------------------------------
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
  },
});

export const {
  setAuthUser,
  logoutUser,
  setSuggestedUsers,
  setUserProfile,
  updateAuthUser,
  clearUserProfile,
} = authSlice.actions;

export default authSlice.reducer;