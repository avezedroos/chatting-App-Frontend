import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../services/api";
import { getMessagesForSelectedUsers } from "../../utils/clearChatHelper";
import { api } from "../../services/api";
import { clearMessagesForUser } from "../features/messagesSlice";
import { removeLastMessage } from "../features/connectionsSlice";

export const clearSelectedChats = createAsyncThunk(
  "messages/clearSelectedChats",
  async (userIds, {dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();

      // Get all message IDs grouped by userId
      const otherUserNames = getMessagesForSelectedUsers(
        state,
        userIds
      );

       if (!otherUserNames.length) {
        return rejectWithValue("No chats selected");
      }

      // Send to backend
      const response = await api.post("/messages/clearmessages", {
        otherUserNames,
      });

      if (response.data.success) {
        console.log("123")
        otherUserNames.forEach((username) => {
          dispatch(clearMessagesForUser({ userId: username }));
          
        });
        dispatch(removeLastMessage({"usernames":otherUserNames}));
      }




    //   return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Unable to clear chats"
      );
    }
  }
);