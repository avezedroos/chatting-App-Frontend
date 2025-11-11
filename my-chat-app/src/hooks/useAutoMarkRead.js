import { useEffect, useRef } from "react";

const useAutoMarkRead = ({
  messages,
  isScreenVisible,
  socketRef,
  scrollRef,
  otherUser,
  auth,
}) => {
  const pendingReadRef = useRef(false);     // tracks if a mark-read is pending
  const markTimeoutRef = useRef(null);      // for batching updates

  useEffect(() => {
    // Always scroll to bottom when messages update
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Get all received messages for this chat
    const receivedMessages = messages.filter(
      (m) => m.sender === otherUser && m.receiver === auth.username
    );

    // Filter messages that are not yet read
    const unreadMessages = receivedMessages.filter(
      (m) => m.status !== "read"
    );

    // Filter messages that are sent but not yet delivered
    const undeliveredMessages = receivedMessages.filter(
      (m) => m.status === "sent"
    );

    // Emit helper for mark-read
    const emitMarkRead = () => {
      if (!socketRef?.current) return;
      console.log("Emitting mark-read for", otherUser, "to", auth.username);
      socketRef.current.emit("mark-read", {
        sender: otherUser,
        receiver: auth.username,
      });
      pendingReadRef.current = false;
    };

    // Emit helper for mark-delivered
    const emitMarkDelivered = () => {
      if (!socketRef?.current) return;
      socketRef.current.emit("message-received", {
        sender: otherUser,
        receiver: auth.username,
      });
    };

    // 🌞 CASE 1: Screen visible → mark all unread messages as "read"
    if (isScreenVisible && unreadMessages.length > 0) {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkRead, 250);
    }

    // 🌙 CASE 2: Screen hidden → mark "sent" messages as "delivered"
    else if (!isScreenVisible && undeliveredMessages.length > 0) {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkDelivered, 400);
      pendingReadRef.current = true;
    }

    // 🌅 CASE 3: Screen becomes visible again → complete pending read
    else if (isScreenVisible && pendingReadRef.current && socketRef?.current) {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkRead, 150);
    }

    // 🧹 Cleanup timeout on unmount or dependency change
    return () => {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
    };
  }, [messages, isScreenVisible, otherUser, auth.username, socketRef, scrollRef]);
};

export default useAutoMarkRead;
