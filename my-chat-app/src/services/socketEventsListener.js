// socketEvents.js
import { setTyping, setUserOffline, setUserOnline } from "../redux/features/chatMetaSlice";
import {incrementUnread, updateOnlineStatusConnection} from "../redux/features/connectionsSlice";
import { addMessage } from "../redux/features/messagesSlice";
import socketService from "./socketService";
// import { setUserOnline, setUserOffline, setUserTyping, clearUserTyping, setUnreadCount,
// } from "../redux/features/statusSlice";

// import { addNewMessage, updateMessageStatus,} from "../redux/features/messagesSlice";
import { useDispatch } from "react-redux";

const setupSocketEvents = (dispatch) => {
  const socket = socketService.getSocket();
    // const dispatch = useDispatch();
  if (!socket) return;


  // ----------------------
  // 🔥 USER STATUS EVENTS
  // ----------------------

  socket.on("user-online", (data) => {
      const {payload}= data
      // console.log("user-online is render", data,payload )
    dispatch(setUserOnline(payload));
    



  });

  socket.on("user-offline", (data) => {
      const {payload} = data;
      const {username, lastseen} = payload
      console.log("user-offline is Running ", payload, username)
    dispatch(setUserOffline(username));
    dispatch(updateOnlineStatusConnection({userId:username, online:false, lastseen:lastseen}));
  });

  // ---- receive message ----
    socket.on("receive-message", (msg) => {
      console.log("receive-message")
      const payload = []
      console.log("receive-message is Running --", msg)
      const data = {Sender:msg.sender,
          messageId:msg._id
      }
      payload.push(data)
      dispatch(addMessage({ "otherUser": msg.sender, msg }));
      dispatch(incrementUnread({username:msg.sender,message : msg.text, time:msg.timestamp}));
      socket.emit("message-received", {
        payload
      });


      //Want to build an loagic also if message recive from user01 and same time there user active chatBox open and on focus then mar read not deliverd


    });

 // ---- typing ----
    socket.on("typing", (data) => {
      console.log("typing is run ", data)
      if (!data?.from) return;
      dispatch(setTyping({username:data.from, isTyping:data.isTyping}))
    });

//   socket.on("user-stop-typing", ({ userId, chatId }) => {
//     dispatch(clearUserTyping({ userId, chatId }));
//   });

//   // ----------------------
//   // 🔥 MESSAGE EVENTS
//   // ----------------------

//   socket.on("message-received", (message) => {
//     dispatch(addNewMessage(message));
//   });

//   socket.on("message-delivered", ({ tempId, messageId }) => {
//     dispatch(
//       updateMessageStatus({
//         tempId,
//         messageId,
//         delivered: true,
//       })
//     );
//   });

//   socket.on("message-read", ({ messageId, readerId }) => {
//     dispatch(
//       updateMessageStatus({
//         messageId,
//         read: true,
//         readerId,
//       })
//     );
//   });

  // ----------------------
  // 🔥 UNREAD COUNTS
  // ----------------------

//   socket.on("increase-unread", ({ chatId }) => {
//     dispatch(setUnreadCount({ chatId }));
//   });
};

export default setupSocketEvents;
