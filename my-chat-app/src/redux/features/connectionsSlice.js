// src/store/connectionsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connections: [],
  filteredConnections: [], // optional
  selectedConnection: null,
};

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    setConnections: (state, action) => {
      state.connections = action.payload;
    },

    selectConnection: (state, action) => {
      state.selectedConnection = action.payload;
    },

    updateConnectionStatus: (state, action) => {
      const { userId, status } = action.payload;

      const conn = state.connections.find((c) => c.userId === userId);
      if (conn) conn.status = status;
    },

   updateLastMessage: (state, action) => {
  const { username, message, time, msgId, match } = action.payload;

  const index = state.connections.findIndex(
    (c) => c.username === username
  );

  if (index === -1) return;

  const conn = state.connections[index];

  // 🛡️ Safety check (keep your logic)
  if (match && conn.lastMessage?.msgId !== msgId) {
    return;
  }

  // ✅ Update lastMessage
  conn.lastMessage = {
    ...conn.lastMessage,
    message,
    time,
    msgId
  };

  // 🔥 DESCENDING ORDER LOGIC (move to top)
  const [updatedConnection] = state.connections.splice(index, 1);
  state.connections.unshift(updatedConnection);
},



    incrementUnread: (state, action) => {
  const { username, message, time, msgId } = action.payload;
  console.log("incrementUnread is running", action.payload);

  // 1️⃣ Find target connection
  const idx = state.connections.findIndex(
    (c) => c.username === username
  );
  if (idx === -1) return;

  const conn = state.connections[idx];

  // 2️⃣ Update unread count
  const unread = (conn.unread || 0) + 1;

  conn.unread = unread;

  // 3️⃣ Update lastMessage (minimal update)
  conn.lastMessage = {
    ...conn.lastMessage,
    message,
    time,
    msgId,
  };

  // 4️⃣ 🔥 DESCENDING ORDER LOGIC (move to top)
  const [updatedConnection] = state.connections.splice(idx, 1);
  state.connections.unshift(updatedConnection);
},

    resetUnread: (state, action) => {
      const userId = action.payload;
      const conn = state.connections.find((c) => c.username === userId);
      if (conn) conn.unread = 0;
    },

    updateOnlineStatusConnection: (state, action) => {
      const { userId, online, lastSeen } = action.payload;

      const conn = state.connections.find((c) => c.userId === userId);
      if (conn) {
        conn.onlineStatus.online = online;
        conn.onlineStatus.lastSeen = lastSeen;
      }
    },

    updateNotes: (state, action) => {
      const { userId, notes } = action.payload;

      const conn = state.connections.find((c) => c.userId === userId);
      if (conn) conn.notes = notes;
    },

    filterConnections: (state, action) => {
      const type = action.payload; // sent / received / pending / accepted
      state.filteredConnections = state.connections.filter(
        (c) => c.status === type || c.direction === type
      );
    },
  },
});

export const {
  setConnections,
  selectConnection,
  updateConnectionStatus,
  updateLastMessage,
  incrementUnread,
  resetUnread,
  updateOnlineStatusConnection,
  updateNotes,
  filterConnections,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
