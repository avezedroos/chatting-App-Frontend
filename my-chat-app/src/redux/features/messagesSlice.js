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
      const { userId, status, messageIds } = action.payload;

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
      console.log("editMessage action received:", action);
      const { username, messageId, newText, isEdited, editedAt } = action.payload;

      // Find the user’s messages collection
      const msgs = state.messagesByUser[username];

      if (!msgs) {
        console.warn(`No messages found for user: ${username}`);
        return;
      }

      // Find the specific message inside the array
      const msg = msgs.find((m) => m._id === messageId);
      if (!msg) return;

      // Update fields
      msg.text = newText;
      msg.isEdited = isEdited;
      msg.editedAt = editedAt;
    },

    // --------------------------------------------------------
    // 8️⃣➕ Add emoji reaction to message
    // --------------------------------------------------------
    addEmojiReaction: (state, action) => {
      const { userID, user, messageId, emoji, reactions } = action.payload;
      console.log("reactions", reactions, Array.isArray(reactions))
      console.log(action.payload)
      const msgs = state.messagesByUser[userID];
      console.log("msg", msgs)
      if (!msgs) return;

      const msg = msgs.find((m) => m._id === messageId);
      if (!msg) return;
      console.log("msg", msg)
      if (!msg.reactions) msg.reactions = [];

      // =====================================================
      // NEW LOGIC — If backend sends a full reactions array
      // =====================================================
      if (Array.isArray(reactions)) {
        console.log("msg.reactions", msg.reactions)
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
    deleteMessageforMe: (state, action) => {
      console.log("deleteMessageforMe action received:", action.payload);
      const { userName, messageIds } = action.payload;

      // Normalize to array (supports single & multiple)
      const idsToDelete = Array.isArray(messageIds)
        ? messageIds
        : [messageIds];

      const msgs = state.messagesByUser[userName];
      if (!msgs) return;
      console.log("Before deletion, messages:", msgs, "IDs to delete:", idsToDelete);
      // Filter out all messages that the user deleted
      state.messagesByUser[userName] = msgs.filter(
        (m) => !idsToDelete.includes(m._id)
      );
    },

    deleteForEveryoneReducer: (state, action) => {
      const { userName, messageIds } = action.payload;

      const idsToDelete = Array.isArray(messageIds)
        ? messageIds
        : [messageIds];
      const msgs = state.messagesByUser[userName];
      if (!msgs) return;

      state.messagesByUser[userName] = msgs.map((msg) => {
    if (!idsToDelete.includes(msg._id)) return msg;

    // ⛔ Replace only these keys (like WhatsApp)
    return {
      ...msg,
      text: "This message was deleted",
      attachments: [],
      reactions: [],
      isDeletedForEveryone: true,
    };
    },
      );
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
  deleteMessageforMe,
  deleteForEveryoneReducer,
  clearMessagesForUser,
  addEmojiReaction
} = messagesSlice.actions;

export default messagesSlice.reducer;
