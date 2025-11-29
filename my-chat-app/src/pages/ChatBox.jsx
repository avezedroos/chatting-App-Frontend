// ChatBox.jsx
import React, { use, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import socketService from "../services/socketService";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import usePageVisibility from "../hooks/usePageVisibility";
import useAutoMarkRead from "../hooks/useAutoMarkRead";
import { timeAgo } from "../../../utility/Mini-Function";
import "../styles/Chatbox.css";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, addTempMessage, replaceTempMessage, setMessagesForUser, updateStatusByUsers } from "../redux/features/messagesSlice";
import { selectMessagesByUser } from "../redux/features/messagesSelectors";

const ChatBox = ({ onClose }) => {

  const dispatch = useDispatch();

  // Refs
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const unsentQueueRef = useRef([]);

  // Redux state
  const { username } = useSelector((state) => state.user);
  const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);
  const {onlineUsers} = useSelector((state) => state.chatMeta);
  const CorelastSeenState  =  useSelector((state)=> state.connections.selectedConnection?.onlineStatus?.lastSeen )
  const {typing} = useSelector((state) => state.chatMeta);

  // States
  // const [typingState, setTypingState] = useState(null);
  const [isScreenVisible, setIsScreenVisible] = useState(true);
  const [lastSeenState, setLastSeenState] = useState(null);
const [replyingTo, setReplyingTo] = useState(null);

  usePageVisibility(setIsScreenVisible);

  // const [lastSeenState, setLastSeenState] = useState("");

useEffect(() => {
  if (!CorelastSeenState) return;

  // 1) Update immediately
  setLastSeenState(timeAgo(CorelastSeenState));

  // 2) Update every 1 minute
  const interval = setInterval(() => {
    setLastSeenState(timeAgo(CorelastSeenState));
  }, 60000);

  // 3) Cleanup interval on unmount or lastSeen change
  return () => clearInterval(interval);

}, [CorelastSeenState]);


  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return; // socket not ready yet

    // ---- reconnect logic ----
    socket.on("connect", () => {
      if (unsentQueueRef.current.length > 0) {
        unsentQueueRef.current.forEach((payload) => {
          socket.emit("send-message", payload, (ack) => {
            if (ack?.ok && ack.serverId) {
              dispatch(replaceTempMessage({ userId: otherUser, tempId, newMessage: ack.data }));
            }
          });
        });

        unsentQueueRef.current = [];
      }
    });

   

    socket.on("messages-read", ({ receiver, messageIds }) => {
      dispatch(updateStatusByUsers({ userId:receiver ,status: "read", messageIds }));
    });

    socket.on("messages-delivered", ({ receiver ,messageIds}) => {
      console.log("messages-delivered")
      dispatch(updateStatusByUsers({ userId: receiver ,  status: "delivered", messageIds }));
    });

    // IMPORTANT: only remove listeners, don't disconnect socket!
    return () => {
      socket.off("connect");
      // socket.off("receive-message");
      socket.off("typing");
      // socket.off("online-status");
      socket.off("messages-read");
      socket.off("messages-delivered");
    };

  }, [otherUser]);


  // fetch messages on user change
  useEffect(() => {
    if (!username || !otherUser) return;
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${username}/${otherUser}`);
        // console.log("Fetched messages:", res.data);
        if (cancelled) return;
        const fetched = res.data || [];

        dispatch(setMessagesForUser({ userId: otherUser, messages: fetched }));
      } catch (err) {
        console.error("Fetch messages error", err);
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [username, otherUser]);

  useAutoMarkRead({
    scrollRef,
    isScreenVisible,
  });

  const handleSend = (text,replyingTo) => {
    if (!text.trim()) return;
    // console.log("replyingTo",replyingTo)
    const tempId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      tempId,
      sender: username,
      receiver: otherUser,
      text: text.trim(),
      timestamp: null,
      status: "pending",
      replyTo: replyingTo?.id
    };
    dispatch(addTempMessage({ userId: otherUser, message: { ...payload, pending: true, delivered: false } }));

    const socket = socketService.getSocket();
    if (socketService.isConnected()) {
      socketService.emit("send-message", payload, (ack) => {
        console.log("ACK received for sent message:", ack);
        if (ack?.status && ack.data?._id) {
          // console.log("ACK received for message:", ack);
          dispatch(replaceTempMessage({ userId: otherUser, tempId, newMessage: ack.data }));
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
    console.log("handleTyping is running")
    if (!socket) return;
    if (isTyping) {
      socketService.emit("typing", { from: username, to: otherUser, isTyping: true });
    }
  };

  

  const otherOnline = onlineUsers.includes(otherUser);
  // console.log("otherUser" , otherUser, "Lastseen ", lastSeenState)

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
              {typing.includes(otherUser)? (
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
        <div className="W-chat-header-right">You: {username}</div>
      </div>

      {/* this is the main chat area */}
      <div className="W-chat-main">
        <div ref={scrollRef} className="W-message-container">
          <MessageList setReplyingTo={setReplyingTo}/>
        </div>
        <div className="W-input-area">
          <MessageInput onSend={handleSend} onTyping={handleTyping} replyingTo={replyingTo}
  clearReply={() => setReplyingTo(null)} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
