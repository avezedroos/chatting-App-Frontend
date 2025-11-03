import React, { use, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, setAuthToken } from "../services/api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import usePageVisibility from "../hooks/usePageVisibility";
import useAutoMarkRead from "../hooks/useAutoMarkRead";

const BACKEND_URL = "https://chatting-app-backend-ofme.onrender.com";

const ChatBox = ({ auth, otherUser }) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingState, setTypingState] = useState(null);
  const [isScreenVisible, setIsScreenVisible] = useState(true);

  // Pass setter to the hook
  usePageVisibility(setIsScreenVisible);

  useEffect(() => {
    console.log("🟢 Screen visibility changed:", isScreenVisible);
  }, [isScreenVisible]);
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);


  //  const isScreenVisible = usePageVisibility();

  // set axios token whenever auth.token changes
  useEffect(() => {
    setAuthToken(auth.token);
  }, [auth.token]);

  // connect socket once when token available
  useEffect(() => {
    if (!auth.token) return;

    const s = io(BACKEND_URL, { auth: { token: auth.token }, transports: ["websocket"] });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("Socket connected", s.id);
    });

    s.on("connect_error", (err) => {
      console.error("Socket connect error", err?.message);
    });

    s.on("receive-message", (msg) => {
      console.log("receive-message", msg);
      setMessages((prev) => [...prev, msg]);
    });

    s.on("online-status", ({ username, online, onlineUserss }) => {
      console.log("online-status", username, online, onlineUserss);
      if (Array.isArray(onlineUserss)) setOnlineUsers(onlineUserss);
      else setOnlineUsers((prev) => {
        // fallback: update single user status
        const set = new Set(prev);
        if (online) set.add(username);
        else set.delete(username);
        return Array.from(set);
      });
    });

    s.on("typing", (data) => {
      // expected: { from, isTyping }
      if (data && data.from) {
        setTypingState(data.isTyping ? data.from : (prev => (prev === data.from ? null : prev)));
      }
    });

    s.on("messages-read", ({ sender, receiver }) => {
      console.log("messages-read event", sender, receiver);
      setMessages((prev) =>
        prev.map((m) => {
          // be permissive: compare by username or id fields if present
          const mSender = m.sender || m.from || m.user;
          const mReceiver = m.receiver || m.to || m.target;
          if (mSender === sender && mReceiver === receiver) {
            return { ...m, read: true };
          }
          return m;
        })
      );
    });

    return () => {
      // cleanup all listeners and disconnect
      s.off();
      s.disconnect();
      socketRef.current = null;
    };
  }, [auth.token]);

  // fetch messages when chat pair changes; after marking read via API, emit mark-read using socketRef when connected
  useEffect(() => {
    if (!auth.username || !otherUser) return;

    let cancelled = false;
    const fetchMessages = async () => {
      try {
        console.log("Fetching messages between", auth.username, "and", otherUser);
        const res = await api.get(`/messages/${auth.username}/${otherUser}`);
        if (cancelled) return;
        setMessages(res.data || []);

        // mark read on API
        await api.put("/messages/mark-read", { sender: otherUser, receiver: auth.username });

        // emit mark-read once socket is connected. If socket not connected yet, wait for connect event.
        const emitMarkRead = () => {
          const s = socketRef.current;
          if (s && s.connected) {
            console.log("Emitting mark-read for", otherUser, "to", auth.username);
            s.emit("mark-read", { sender: otherUser, receiver: auth.username });
          } else {
            console.log("Socket not connected yet, will emit mark-read on connect.");
            if (s) {
              const onConnectTmp = () => {
                s.emit("mark-read", { sender: otherUser, receiver: auth.username });
                s.off("connect", onConnectTmp);
              };
              s.on("connect", onConnectTmp);
            }
          }
        };

        emitMarkRead();
      } catch (err) {
        console.error("Fetch messages error", err);
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.username, otherUser]);

  // auto-scroll when messages change and auto mark-read hook
  useAutoMarkRead({
    messages,
    socketRef,
    scrollRef,
    otherUser,
    auth,
    isScreenVisible,
  });

  // send message
  const handleSend = (text) => {
    const s = socketRef.current;
    if (!s) {
      console.warn("Socket not ready - cannot send message");
      return;
    }
    const payload = { sender: auth.username, receiver: otherUser, text };
    // emit and rely on server to persist + broadcast back
    s.emit("send-message", payload);
  };

  // typing handler with debounce + auto-clear
  const handleTyping = (isTyping) => {
    const s = socketRef.current;
    if (!s) return;

    // if user is actively typing, send isTyping=true and set/refresh timeout to send false later
    if (isTyping) {
      s.emit("typing", { from: auth.username, to: otherUser, isTyping: true });

      // clear previous timeout and set a new one to send false after 1.5s of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        s.emit("typing", { from: auth.username, to: otherUser, isTyping: false });
        typingTimeoutRef.current = null;
      }, 1500);
    } else {
      // explicit stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      s.emit("typing", { from: auth.username, to: otherUser, isTyping: false });
    }
  };

  const otherOnline = Array.isArray(onlineUsers) ? onlineUsers.includes(otherUser) : false;

  return (
    <div className="chat-wrapper">
      <div className="header">
        <div>
          <strong>{otherUser}</strong>
          <div className="small">{otherOnline ? <span className="status">Online</span> : <span className="small">Offline</span>}</div>
        </div>
        <div className="small">You: {auth.username}</div>
      </div>

      <div className="chat-main">
        <div className="chat-area">
          <div ref={scrollRef} className="message-list">
            <MessageList messages={messages} currentUser={auth.username} />
          </div>

          <div style={{ padding: "8px 12px" }}>
            {typingState && typingState === otherUser ? <div className="typing">{otherUser} is typing...</div> : null}
          </div>

          <MessageInput onSend={handleSend} onTyping={(isTyping) => handleTyping(isTyping)} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
