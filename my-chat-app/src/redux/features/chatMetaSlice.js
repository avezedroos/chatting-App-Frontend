import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineUsers: [],
  typing: [],          // { username: true/false }
  unreadCount: {},     // { username: number }
  lastSeen: {},        // { username: timestamp }
  activeChatUser: null,
};

const chatMetaSlice = createSlice({
  name: "chatMeta",
  initialState,

  reducers: {
    // ONLINE / OFFLINE
    setUserOnline: (state, action) => {
      const payload = action.payload;

      // -------------------------------
      // CASE 1: Array of usernames
      // -------------------------------
      if (Array.isArray(payload)) {
        // Remove duplicates automatically
        state.onlineUsers = Array.from(new Set(payload));
        return;
      }

      // -------------------------------
      // CASE 2: Single username
      // -------------------------------
      if (typeof payload === "string" && payload.trim() !== "") {
        if (!state.onlineUsers.includes(payload)) {
          state.onlineUsers.push(payload);
        }
      }
    },


   setUserOffline: (state, action) => {
  const username = action.payload;
  console.log("username",username)
  state.onlineUsers = state.onlineUsers.filter(u => u !== username);
},


    // TYPING
   setTyping: (state, action) => {
  const { username, isTyping } = action.payload;

  if (isTyping) {
    // add username IF not already inside
    if (!state.typing.includes(username)) {
      state.typing.push(username);
    }
  } else {
    // remove username
    state.typing = state.typing.filter((u) => u !== username);
  }
},


    // UNREAD MESSAGES
    incrementUnread: (state, action) => {
      const username = action.payload;
      state.unreadCount[username] = (state.unreadCount[username] || 0) + 1;
    },
    clearUnread: (state, action) => {
      const username = action.payload;
      state.unreadCount[username] = 0;
    },

    // LAST SEEN
    updateLastSeen: (state, action) => {
      const { username, time } = action.payload;
      state.lastSeen[username] = time;
    },

    // ACTIVE CHAT
    setActiveChatUser: (state, action) => {
      state.activeChatUser = action.payload;
    },
  },
});

export const {
  setUserOnline,
  setUserOffline,
  setTyping,
  incrementUnread,
  clearUnread,
  updateLastSeen,
  setActiveChatUser,

} = chatMetaSlice.actions;

export default chatMetaSlice.reducer;
