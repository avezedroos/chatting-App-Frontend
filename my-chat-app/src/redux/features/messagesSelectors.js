import { createSelector } from "@reduxjs/toolkit";

export const selectMessagesByUser = createSelector(
  [
    (state) => state.messages.messagesByUser,
    (_, otherUser) => otherUser,
  ],
  (messagesByUser, otherUser) => {
    return messagesByUser[otherUser] || [];
  }
);

// import { createSelector } from "@reduxjs/toolkit";

export const selectMessageById = createSelector(
  [
    (state, otherUser) => state.messages.messagesByUser[otherUser],
    (_, __, messageId) => messageId,
  ],
  
  (messages, messageId) =>
    messages?.find((msg) => msg._id === messageId) || null
);