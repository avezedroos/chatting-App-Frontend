// import { useSelector } from "react-redux";
import { u } from "framer-motion/client";
import { deleteForEveryoneReducer, deleteMessageforMe } from "../redux/features/messagesSlice";
import socketService from "../services/socketService";
import { canEditMessage } from "./minifunctions";
import { updateLastMessage } from "../redux/features/connectionsSlice";

 export const deleteMessagesForMe = (dispatch,messageIds = [],otherUser) => {

try {
    console.log("Deleting messages for me:", messageIds);
    if (!messageIds ) return;
     if (!Array.isArray(messageIds)) {
    messageIds = [messageIds]; // convert single into array
  }
  // Remove duplicates
  const uniqueIds = [...new Set(messageIds)];
  dispatch(deleteMessageforMe({userName:otherUser,messageIds:uniqueIds}));

  // Emit delete request for all messages

  socketService.emit("deleteMessageForMeBulk", {
    messageIds: uniqueIds,
  });
} catch (error) {
    console.error("Delete messages for me failed:", error);
}


 
};

export const deleteMessagesForEveryone = (dispatch,messages = [], username ) => {
  if (!Array.isArray(messages)) {
    messages = [messages]; // convert single → array
  }
const limitMinutes = 85; // time limit for delete-for-everyone
  // Filter messages that are allowed for delete-for-everyone
  const validMessages = messages.filter((msg) => {
    // Sender can delete only their own messages
    if (msg.sender !== username) return false;

    // Time validation
    return canEditMessage(msg.timestamp, limitMinutes);
  });

  if (validMessages.length === 0) {
    console.log("❌ No messages eligible for delete-for-everyone");
    return;
  }

  // Extract message IDs
  const ids = validMessages.map((m) => m._id);
dispatch(deleteForEveryoneReducer({userName:validMessages[0].receiver,messageIds:ids}));
dispatch(updateLastMessage({
  username:validMessages[0].receiver,
  message: "This message was deleted",
  time: new Date().toISOString(),
  msgId: ids[ids.length - 1], // assuming last deleted message as lastMessage
  match: true,
}));
  // Send socket request (only once)
  socketService.emit("deleteMessageForEveryoneBulk", {
    messageIds: ids,
  });
};
