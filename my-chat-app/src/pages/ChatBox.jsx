// ChatBox.jsx
import React, { useEffect, useRef, useState } from "react";
import { api, setAuthToken } from "../services/api";
import socketService from "../services/socketService";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import usePageVisibility from "../hooks/usePageVisibility";
import useAutoMarkRead from "../hooks/useAutoMarkRead";
import { timeAgo } from "../../../utility/Mini-Function";
import "../styles/chatbox.css";

const ChatBox = ({ auth = { username: "", token: "" }, otherUser, onClose }) => {
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const unsentQueueRef = useRef([]);

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingState, setTypingState] = useState(null);
  const [isScreenVisible, setIsScreenVisible] = useState(true);
  const [lastSeenState, setLastSeenState] = useState(null);

  usePageVisibility(setIsScreenVisible);

  useEffect(() => {
    if (!auth.token) return;
    setAuthToken(auth.token);

    const socket = socketService.connect(auth.token);

    // handle reconnect
    socket.on("connect", () => {
      if (unsentQueueRef.current.length > 0) {
        unsentQueueRef.current.forEach((payload) => {
          socket.emit("send-message", payload, (ack) => {
            if (ack?.ok && ack.serverId) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.tempId === payload.tempId
                    ? { ...m, pending: false, delivered: true, _id: ack.serverId }
                    : m
                )
              );
            }
          });
        });
        unsentQueueRef.current = [];
      }
    });

    // receive message
    socket.on("receive-message", (msg) => {
      console.log("Received message via socket:", msg);
      // console.table(msg);
      setMessages((prev) => [...prev, msg]);
      // socket.emit("message-received", { messageId: msg._id, sender: msg.sender, receiver: msg.receiver })
    });


    // online status
    socket.on("online-status", ({ username, online, onlineUserss, lastSeen }) => {
      if (lastSeen) {
        if (socketService.lastSeenInterval) clearInterval(socketService.lastSeenInterval);
        setLastSeenState(timeAgo(lastSeen));
        socketService.lastSeenInterval = setInterval(() => setLastSeenState(timeAgo(lastSeen)), 60000);
      }

      if (Array.isArray(onlineUserss)) {
        setOnlineUsers(onlineUserss);
      } else if (username) {
        setOnlineUsers((prev) => {
          const set = new Set(prev);
          online ? set.add(username) : set.delete(username);
          return Array.from(set);
        });
      }
    });

    socket.on("typing", (data) => {
      if (!data?.from) return;
      setTypingState((prev) => (data.isTyping ? data.from : prev === data.from ? null : prev));
    });

    socket.on("messages-read", ({ sender, receiver }) => {
      setMessages((prev) =>
        prev.map((m) =>
          (m.sender === sender && m.receiver === receiver) ? { ...m, status: "read" } : m
        )
      );
    });

    socket.on("messages-delivered", ({ sender, receiver }) => {
      setMessages((prev) =>
        prev.map((m) =>
          (m.sender === sender && m.receiver === receiver) ? { ...m, status: "delivered" } : m
    )
      );
    });

    return () => {
      socketService.disconnect();
    };
  }, [auth.token]);

  // fetch messages on user change
  useEffect(() => {
    if (!auth.username || !otherUser) return;
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${auth.username}/${otherUser}`);
        if (cancelled) return;
        const fetched = res.data || [];
        setMessages(fetched);
      } catch (err) {
        console.error("Fetch messages error", err);
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [auth.username, otherUser]);

  useAutoMarkRead({
    messages,
    socketRef: { current: socketService.getSocket() },
    scrollRef,
    otherUser,
    auth,
    isScreenVisible,
  });

  const handleSend = (text) => {
    if (!text.trim()) return;
    const tempId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      tempId,
      sender: auth.username,
      receiver: otherUser,
      text: text.trim(),
      timestamp: null,
      status: "pending",
    };
    setMessages((prev) => [...prev, { ...payload, pending: true, delivered: false }]);

    const socket = socketService.getSocket();
    if (socketService.isConnected()) {
      socketService.emit("send-message", payload, (ack) => {
        console.log("ACK received for sent message:", ack);
        if (ack?.status && ack.data?._id) {
          console.log("ACK received for message:", ack);
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId ? ack.data : m
            )
          );
        } else {
          unsentQueueRef.current.push(payload);
        }
      });
    } else {
      unsentQueueRef.current.push(payload);
      console.warn("Socket disconnected. Message queued.");
    }
  };

  const handleTyping = (isTyping) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    if (isTyping) {
      socketService.emit("typing", { from: auth.username, to: otherUser, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("typing", { from: auth.username, to: otherUser, isTyping: false });
        typingTimeoutRef.current = null;
      }, 1500);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.emit("typing", { from: auth.username, to: otherUser, isTyping: false });
    }
  };

  const otherOnline = onlineUsers.includes(otherUser);

  return (
    <div className="W-chatbox">
      
      {/* this is a header of chatbox */}
      <div className="W-chat-header">
        <div className="W-chat-header-left">
          <button className="W-back-btn" onClick={onClose}>←</button>
          <div className="W-chat-avatar">{otherUser?.charAt(0).toUpperCase()}</div>
          <div className="W-chat-meta">
            <div className="W-chat-name">{otherUser}</div>
            <div className="W-chat-sub">
              {typingState === otherUser ? (
                <span className="W-typing">{otherUser} is typing…</span>
              ) : otherOnline ? (
                <span className="W-online">Online</span>
              ) : lastSeenState ? (
                <span className="W-lastseen">Last seen: {lastSeenState}</span>
              ) : (
                <span className="W-offline">Offline</span>
              )}
            </div>
          </div>
        </div>
        <div className="W-chat-header-right">You: {auth.username}</div>
      </div>

              {/* this is the main chat area */}
      <div className="W-chat-main">
        <div ref={scrollRef} className="W-message-container">
          <MessageList messages={messages} currentUser={auth.username} />
        </div>
        <div className="W-input-area">
          <MessageInput onSend={handleSend} onTyping={handleTyping} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
