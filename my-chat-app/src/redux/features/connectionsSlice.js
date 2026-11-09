// src/store/connectionsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connections: [],
  // filteredConnections: [], // optional
  selectedConnection: null,
};

const addPinToConnection = (conn, pinData) => {
  // console.log("addPinToConnection is running",conn)
  if (!conn) return;

  if (!Array.isArray(conn.pin)) {
    conn.pin = [];
  }

  // Prevent duplicate pins
  if (conn.pin.some((p) => p.msgId === pinData.msgId)) {
    return;
  }

  conn.pin.push({
    msgId: pinData.msgId,
    type: pinData.type,
    timestamp: pinData.timestamp,
    index: 0,
  });

  // Oldest message first
  conn.pin.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
  );

  // Recalculate indexes
  conn.pin.forEach((pin, index) => {
    pin.index = index;
  });
};

const removePinFromConnection = (conn, msgId) => {
  if (!conn || !Array.isArray(conn.pin)) return;

  // Remove the selected message pin
  conn.pin = conn.pin.filter(
    (pin) => String(pin.msgId) !== String(msgId)
  );

  // Recalculate indexes
  conn.pin.forEach((pin, index) => {
    pin.index = index;
  });
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

    pinMessage: (state, action) => {
  const { username, msgId, type, timestamp } = action.payload;
  console.log(action.payload)

  // 1. Update main connections array
  const connection = state.connections.find(
    (c) => c.username === username
  );

  addPinToConnection(connection, {
    msgId,
    type,
    timestamp,
  });

  // 2. Update selected connection if it matches
  if (state.selectedConnection?.username === username) {
    addPinToConnection(state.selectedConnection, {
      msgId,
      type,
      timestamp,
    });
  }

  
},

unpinMessage: (state, action) => {
  const { username, msgId } = action.payload;

  // 1. Update main connections array
  const connection = state.connections.find(
    (c) => c.username === username
  );

  removePinFromConnection(connection, msgId);

  // 2. Update selected connection if it matches
  if (state.selectedConnection?.username === username) {
    removePinFromConnection(state.selectedConnection, msgId);
  }
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
  pinMessage,
  unpinMessage
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
