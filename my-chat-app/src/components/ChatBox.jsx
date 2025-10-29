import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, setAuthToken } from "../services/api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const BACKEND_URL = "https://chatting-app-backend-ofme.onrender.com";

const ChatBox = ({ auth, otherUser }) => {
  // auth: { token, username, avatar }
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingState, setTypingState] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    // set axios default token
    setAuthToken(auth.token);

    // connect socket with token passed in auth
    const s = io(BACKEND_URL, { auth: { token: auth.token } });

    s.on("connect_error", (err) => {
      console.error("Socket connect error", err.message);
      if (err && err.message)
        // alert("Socket auth failed: " + err.message);
      console.log("Socket auth failed: " + err.message);
    });

    s.on("receive-message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    s.on("online-status", ({ username, online }) => {
      setOnlineUsers(prev => ({ ...prev, [username]: online }));
    });

    s.on("typing", (data) => {
      // data: { from, isTyping }
      setTypingState(data.isTyping ? data.from : null);
    });

    s.on("messages-read", ({ sender, receiver }) => {
      // mark messages in UI as read
      setMessages(prev => prev.map(m => (m.sender === sender && m.receiver === receiver ? { ...m, read: true } : m)));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [auth.token]);

  useEffect(() => {
    // fetch chat history with otherUser
    const fetch = async () => {
      console.log("Fetching messages between", auth.username, "and", otherUser);
      try {
        const res = await api.get(`/messages/${auth.username}/${otherUser}`);
        setMessages(res.data);
        // mark as read messages from otherUser to me
        await api.put("/messages/mark-read", { sender: otherUser, receiver: auth.username });
        // inform via socket
        socket?.emit("mark-read", { sender: otherUser, receiver: auth.username });
      } catch (err) {
        console.error("Fetch messages error", err);
      }
    };
    if (auth.username && otherUser) fetch();
  // eslint-disable-next-line
  }, [auth.username, otherUser]);

  // auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (text) => {
    if (!socket) return;
    const payload = { sender: auth.username, receiver: otherUser, text };
    socket.emit("send-message", payload);
    // message will be pushed back by server via receive-message so UI gets authoritative saved message
  };

  const handleTyping = (isTyping) => {
    socket?.emit("typing", { from: auth.username, to: otherUser, isTyping });
  };

  const otherOnline = !!onlineUsers[otherUser];
  console.log("onlineUsers",onlineUsers,"otherOnline",otherOnline,otherUser);

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

          <div style={{padding:"8px 12px"}}>
            {typingState && typingState === otherUser ? <div className="typing">{otherUser} is typing...</div> : null}
          </div>

          <MessageInput onSend={handleSend} onTyping={handleTyping} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
