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
    // -----------------------------------
    // SET AUTH USER
    // -----------------------------------
    setAuthUser: (state, action) => {
      state.user = action.payload || null;
    },

    // -----------------------------------
    // LOGOUT USER (COMPLETE RESET)
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
    // PROFILE BEING VIEWED
    // -----------------------------------
    setUserProfile: (state, action) => {
      state.userProfile = action.payload || null;
    },

    // -----------------------------------
    // PROFILE SELECTOR
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
  setSelectedUser
} = authSlice.actions;

export default authSlice.reducer;
