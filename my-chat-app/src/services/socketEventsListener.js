// socketEvents.js
import { setTyping, setUserOffline, setUserOnline } from "../redux/features/chatMetaSlice";
import { incrementUnread, updateLastMessage, updateOnlineStatusConnection } from "../redux/features/connectionsSlice";
import { addMessage, deleteForEveryoneReducer, editMessage } from "../redux/features/messagesSlice";
import socketService from "./socketService";

const setupSocketEvents = (dispatch) => {
  const socket = socketService.getSocket();
  if (!socket) return;

  // ----------------------
  // 🔥 USER STATUS EVENTS
  // ----------------------

  socket.on("user-online", (data) => {
    const { payload } = data
    dispatch(setUserOnline(payload));
  });

  socket.on("user-offline", (data) => {
    const { payload } = data;
    const { username, lastseen } = payload
    dispatch(setUserOffline(username));
    dispatch(updateOnlineStatusConnection({ userId: username, online: false, lastseen: lastseen }));
  });

  // ---- receive message ----
  socket.on("receive-message", (msg) => {
    const payload = []
    const data = {
      Sender: msg.sender,
      messageId: msg._id
    }
    payload.push(data)
    dispatch(addMessage({ "otherUser": msg.sender, msg }));
    dispatch(incrementUnread({ username: msg.sender, message: msg.text, time: msg.timestamp ,msgId:msg._id }));
    socket.emit("message-received", {
      payload
    });


    //Want to build an loagic also if message recive from user01 and same time there user active chatBox open and on focus then mar read not deliverd


  });

  // ---- typing ----
  socket.on("typing", (data) => {
    if (!data?.from) return;
    dispatch(setTyping({ username: data.from, isTyping: data.isTyping }))
  });

  // ---- message updated ----
  socket.on("messageUpdated", (data) => {
    dispatch(editMessage(data));
    dispatch(updateLastMessage({
      username: data.username,
      message: data.newText,
      time: data.editedAt,
      msgId: data.messageId,
      match: true,
    }));
  }
  );

  socket.on("messagesDeletedForEveryoneBulk", (data) => {
     console.log("messagesDeletedForEveryoneBulk is running", data)
    const {messageIds, sender,timestamp } = data;
    dispatch(deleteForEveryoneReducer({ userName: sender, messageIds: messageIds }));
    messageIds.forEach(id =>{
       dispatch(updateLastMessage({
      username: sender,
      message: " this Message Deleted",
      time: timestamp,
      msgId: id,
      match: true,
    }));
    }
    );

    
  } 
  );
};

export default setupSocketEvents;
