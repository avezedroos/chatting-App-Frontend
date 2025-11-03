import { useEffect, useRef } from "react";

const useAutoMarkRead = ({
  messages,
  isScreenVisible,
  socketRef,
  scrollRef,
  otherUser,
  auth,
}) => {
  const pendingMarkRef = useRef(false);     // tracks if a mark-read is waiting
  const markTimeoutRef = useRef(null);      // for batching multiple updates

  useEffect(() => {
    // Always scroll to bottom when messages update
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Check for unread messages
    const hasUnread = messages.some(
      (m) => m.sender === otherUser && m.receiver === auth.username && !m.read
    );

    // Helper to emit mark-read once (batched)
    const emitMarkRead = () => {
      if (!socketRef?.current) return;
      console.log("✅ Emitting mark-read event...");
      socketRef.current.emit("mark-read", {
        sender: otherUser,
        receiver: auth.username,
      });
      pendingMarkRef.current = false;
    };

    // If screen visible and there are unread messages
    if (isScreenVisible && hasUnread) {
      // Batch using timeout — prevents multiple emits if many messages arrive fast
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkRead, 250);
    }

    // If screen hidden but unread exist → mark as pending
    else if (!isScreenVisible && hasUnread) {
      pendingMarkRef.current = true;
      console.log("🕒 Mark-read pending until screen visible again");
    }

    // If screen becomes visible again after being hidden
    else if (isScreenVisible && pendingMarkRef.current && socketRef?.current) {
      console.log("🔁 Screen visible again — processing pending mark-read");
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
      markTimeoutRef.current = setTimeout(emitMarkRead, 150);
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);
    };
  }, [messages, isScreenVisible, otherUser, auth.username, socketRef, scrollRef]);
};

export default useAutoMarkRead;
