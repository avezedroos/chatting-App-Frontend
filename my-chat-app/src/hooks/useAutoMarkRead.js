import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMessagesByUser } from "../redux/features/messagesSelectors";
import socketService from "../services/socketService";
import { updateStatusByUsers } from "../redux/features/messagesSlice";
import { resetUnread } from "../redux/features/connectionsSlice";

const useAutoMarkRead = ({
  
  scrollRef,
 
}) => {
  const pendingReadRef = useRef(false);     // tracks if a mark-read is pending
  const markTimeoutRef = useRef(null);      // for batching updates

  //redux States
 const { username } = useSelector((state) => state.user);
  const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);
  const messages = useSelector((state) => selectMessagesByUser(state, otherUser));
  const isScreenVisible = useSelector((state) => state.ui.isScreenVisible);
 
const dispatch = useDispatch()
  const socket = socketService.getSocket();
  useEffect(() => {

    // Always scroll to bottom when messages update
    if (socket) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Get all received messages for this chat
    const receivedMessages = messages.filter(
      (m) => m.sender === otherUser && m.receiver === username
    );

    // Filter messages that are not yet read
    const unreadMessages = receivedMessages.filter(
      (m) => m.status !== "read"
    );

    const messageIds = messages.map(m => m._id);

    // Filter messages that are sent but not yet delivered
    const undeliveredMessages = receivedMessages.filter(
      (m) => m.status === "sent"
    );

    // Emit helper for mark-read
    const emitMarkRead = () => {
      if (!socket) return;
      console.log("Emitting mark-read for", otherUser, "to", username);
      console.log("Emitting mark-read for", otherUser, "to", username);
      console.log("unreadMessages",unreadMessages)
      socket.emit("mark-read", {
        sender: otherUser,
        receiver: username,
        messageIds:messageIds,
      });
      dispatch(resetUnread(otherUser));
      dispatch(updateStatusByUsers({userId:otherUser , status: "read", messageIds }));
      pendingReadRef.current = false;
    };

    // 🌞 CASE 1: Screen visible → mark all unread messages as "read"
    if (isScreenVisible && unreadMessages.length > 0) {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkRead, 250);
    }

    // 🌙 CASE 2: Screen hidden → mark "sent" messages as "delivered"
    // else if (!isScreenVisible && undeliveredMessages.length > 0) {
    //   if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
    //   markTimeoutRef.current = setTimeout(emitMarkDelivered, 400);
    //   pendingReadRef.current = true;
    // }

    // 🌅 CASE 3: Screen becomes visible again → complete pending read
    else if (isScreenVisible && pendingReadRef.current && socket) {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkRead, 150);
    }

    // 🧹 Cleanup timeout on unmount or dependency change
    return () => {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
    };
  }, [messages, isScreenVisible, otherUser, username, scrollRef]);
};

export default useAutoMarkRead;
