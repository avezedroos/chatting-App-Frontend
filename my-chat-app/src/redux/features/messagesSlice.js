import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messagesByUser: {},      // { userId: [msg, msg, msg] }
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,

  reducers: {
    // --------------------------------------------------------
    // 1️⃣ Set messages when opening a chat
    // --------------------------------------------------------
    setMessagesForUser: (state, action) => {
      const { userId, messages } = action.payload;
      state.messagesByUser[userId] = messages;
    },

    // --------------------------------------------------------
    // 2️⃣ Add new incoming message
    // --------------------------------------------------------
    addMessage: (state, action) => {
      const { otherUser, msg } = action.payload;

      if (!state.messagesByUser[otherUser]) {
        state.messagesByUser[otherUser] = [];
      }

      state.messagesByUser[otherUser].push(msg);
    },

    // --------------------------------------------------------
    // 3️⃣ Add pending message (user sending)
    // --------------------------------------------------------
    addTempMessage: (state, action) => {
      const { userId, message } = action.payload;
      if (!state.messagesByUser[userId]) {
        state.messagesByUser[userId] = [];
      }
      state.messagesByUser[userId].push(message);
    },

    // --------------------------------------------------------
    // 4️⃣ Replace temp message with server message (ACK)
    // --------------------------------------------------------
    replaceTempMessage: (state, action) => {
      const { userId, tempId, newMessage } = action.payload;
      const msgs = state.messagesByUser[userId];
      if (!msgs) return;

      const index = msgs.findIndex((m) => m.tempId === tempId);
      if (index !== -1) msgs[index] = newMessage;
    },

    // --------------------------------------------------------
    // 5️⃣ Global status updates (Delivered / Read)
    // Optimized + based on user's logic
    // --------------------------------------------------------
    updateStatusByUsers: (state, action) => {
      const { userId,  status ,messageIds} = action.payload;

      const msgs = state.messagesByUser[userId];
  if (!msgs) return;

  const idSet = new Set(messageIds);

  msgs.forEach((m) => {
    if (idSet.has(m._id)) {
      m.status = status;
    }
  });
    },

    // --------------------------------------------------------
    // 6️⃣ Mark all messages in a chat as read
    // (used when user views chat screen)
    // --------------------------------------------------------
    markAllReadForUser: (state, action) => {
      const { userId } = action.payload;
      const msgs = state.messagesByUser[userId];
      if (!msgs) return;

      msgs.forEach((m) => {
        if (m.status !== "read") m.status = "read";
      });
    },

    // --------------------------------------------------------
    // 7️⃣ Mark all pending as delivered (reconnect)
    // --------------------------------------------------------
    markAllPendingDelivered: (state, action) => {
      const { userId } = action.payload;
      const msgs = state.messagesByUser[userId];
      if (!msgs) return;

      msgs.forEach((m) => {
        if (m.status === "pending") m.status = "delivered";
      });
    },

    // --------------------------------------------------------
    // 8️⃣ Edit message
    // --------------------------------------------------------
    editMessage: (state, action) => {
      const { userId, messageId, newText } = action.payload;
      const msgs = state.messagesByUser[userId];
      if (!msgs) return;

      const msg = msgs.find((m) => m._id === messageId);
      if (msg) msg.text = newText;
    },
    // --------------------------------------------------------
    // 8️⃣➕ Add emoji reaction to message
    // --------------------------------------------------------
    addEmojiReaction: (state, action) => {
  const { userID, user, messageId, emoji, reactions } = action.payload;
      console.log("reactions",reactions, Array.isArray(reactions))
      console.log(action.payload)
  const msgs = state.messagesByUser[userID];
      console.log("msg",msgs)
  if (!msgs) return;
    
  const msg = msgs.find((m) => m._id === messageId);
  if (!msg) return;
      console.log("msg",msg)
  if (!msg.reactions) msg.reactions = [];

  // =====================================================
  // NEW LOGIC — If backend sends a full reactions array
  // =====================================================
  if (Array.isArray(reactions)) {
    console.log("msg.reactions",msg.reactions)
    msg.reactions = reactions; // overwrite to backend state
    return;
  }

  // ========== YOUR OLD LOGIC BELOW — UNCHANGED ==========

  // Find if user already reacted
  const prevReactionIndex = msg.reactions.findIndex(
    (r) => r.user === user
  );
  const prevReaction = msg.reactions[prevReactionIndex];

  // =====================================================
  // RULE 2 — Remove reaction (emoji=null OR same emoji)
  // =====================================================
  if (!emoji || (prevReaction && prevReaction.emoji === emoji)) {
    if (prevReactionIndex !== -1) {
      msg.reactions.splice(prevReactionIndex, 1); // remove reaction
    }
    return;
  }

  // =====================================================
  // RULE 4 — User reacted with different emoji → update
  // =====================================================
  if (prevReactionIndex !== -1) {
    msg.reactions[prevReactionIndex].emoji = emoji;
    msg.reactions[prevReactionIndex].timestamp = Date.now();
    return;
  }

  // =====================================================
  // RULE 5 — New reaction → push
  // =====================================================
  msg.reactions.push({
    user,
    emoji,
    timestamp: Date.now(),
  });
},



    // --------------------------------------------------------
    // 9️⃣ Delete message
    // --------------------------------------------------------
    deleteMessage: (state, action) => {
      const { userId, messageId } = action.payload;
      const msgs = state.messagesByUser[userId];
      if (!msgs) return;

      state.messagesByUser[userId] = msgs.filter((m) => m._id !== messageId);
    },

    // --------------------------------------------------------
    // 🔟 Clear chat (optional)
    // --------------------------------------------------------
    clearMessagesForUser: (state, action) => {
      const { userId } = action.payload;
      delete state.messagesByUser[userId];
    },
  },
});

// Export actions
export const {
  setMessagesForUser,
  addMessage,
  addTempMessage,
  replaceTempMessage,
  updateStatusByUsers,
  markAllReadForUser,
  markAllPendingDelivered,
  editMessage,
  deleteMessage,
  clearMessagesForUser,
  addEmojiReaction
} = messagesSlice.actions;

export default messagesSlice.reducer;
