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
  const { username, message, time, msgId , match} = action.payload;

  const conn = state.connections.find((c) => c.username === username);
  if (!conn) return;

  // If existing lastMessage id does NOT match → don't update
  if ( match && conn.lastMessage?.msgId !== msgId) {
    return; // ❗ do nothing
  }

  // If msgId matches -> update the message
  conn.lastMessage.message = message;
  conn.lastMessage.time = time;
  conn.lastMessage.msgId = msgId;
},


    incrementUnread: (state, action) => {
      const { username, message, time ,msgId } = action.payload;
      console.log("incrementUnread is running", action.payload)

      // find only the target connection (FAST)
      const idx = state.connections.findIndex(c => c.username === username);
      if (idx === -1) return; // no match → nothing to update

      const conn = state.connections[idx];

      // Update only if message/time actually changed (Stops rerender spam)
      const unread = (conn.unread || 0) + 1;

      // update only required fields
      conn.unread = unread;
      conn.lastMessage = {
        ...conn.lastMessage,
        message,
        time,
        msgId,
      };
    }

    ,
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
