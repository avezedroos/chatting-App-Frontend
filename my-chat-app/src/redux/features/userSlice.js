// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { setAuthToken } from "../../services/api";

const initialState = {
  // Full MongoDB User object returned from backend
  username: null,
  avatar: null,
  invitecode: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // When login success
    setUser: (state, action) => {
      const { isAuthenticated, userdata } = action.payload;
      // console.log("userdata", userdata)
      state.username = userdata.username;
      state.avatar = userdata.avatar;
      state.invitecode = userdata.inviteCode;
      state.isAuthenticated = isAuthenticated;
    },

    logoutUser: (state) => {
      state.username = null;
      state.avatar = null;
      state.invitecode = null;
      state.isAuthenticated = false;
      setAuthToken(null);
      sessionStorage.removeItem("token");
    },

    updateAvatar: (state, action) => {
        state.avatar = action.payload;
    },
  },
});

export const { setUser, logoutUser, updateAvatar } = userSlice.actions;

export default userSlice.reducer;
