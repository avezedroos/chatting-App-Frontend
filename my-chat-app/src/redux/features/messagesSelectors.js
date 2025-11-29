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
