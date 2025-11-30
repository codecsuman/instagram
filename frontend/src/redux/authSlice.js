import { createSlice } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const initialState = {
  user: savedUser
    ? { ...JSON.parse(savedUser), token: savedToken || null }
    : null,

  suggestedUsers: [],
  userProfile: null,
  selectedUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    // ✅ LOGIN / RESTORE USER
    setAuthUser: (state, action) => {
      const user = action.payload;

      state.user = user;

      // ✅ Persist login
      localStorage.setItem("user", JSON.stringify(user));

      if (user?.token) {
        localStorage.setItem("token", user.token);
      }
    },

    // ✅ LOGOUT (FULL CLEANUP)
    clearAuthUser: (state) => {
      state.user = null;
      state.userProfile = null;
      state.selectedUser = null;
      state.suggestedUsers = [];

      // ✅ Cleanup storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    // ✅ SUGGESTED USERS
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },

    // ✅ PROFILE
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },

    // ✅ CHAT USER
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  }
});

export const {
  setAuthUser,
  clearAuthUser,
  setSuggestedUsers,
  setUserProfile,
  setSelectedUser
} = authSlice.actions;

export default authSlice.reducer;
