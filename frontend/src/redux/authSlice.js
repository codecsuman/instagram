import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,                // Logged-in user
  suggestedUsers: [],        // List of suggestions
  userProfile: null,         // Profile being viewed
  selectedUserForProfile: null, // Avoids conflict with chat slice
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // -----------------------------------
    // SET AUTH USER
    // -----------------------------------
    setAuthUser: (state, action) => {
      state.user = action.payload || null; // always safe
    },

    // -----------------------------------
    // LOGOUT USER (complete reset)
    // -----------------------------------
    logoutUser: (state) => {
      state.user = null;
      state.suggestedUsers = [];
      state.userProfile = null;
      state.selectedUserForProfile = null;
    },

    // -----------------------------------
    // SUGGESTED USERS
    // -----------------------------------
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    // -----------------------------------
    // VIEWED PROFILE DATA
    // -----------------------------------
    setUserProfile: (state, action) => {
      state.userProfile = action.payload || null;
    },

    // -----------------------------------
    // SELECT PROFILE USER
    // -----------------------------------
    setSelectedUser: (state, action) => {
      state.selectedUserForProfile = action.payload || null;
    },
  },
});

export const {
  setAuthUser,
  logoutUser,
  setSuggestedUsers,
  setUserProfile,
  setSelectedUser,
} = authSlice.actions;

export default authSlice.reducer;
