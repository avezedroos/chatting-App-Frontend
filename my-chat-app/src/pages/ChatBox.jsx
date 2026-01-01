// ChatBox.jsx
import React, { useEffect, useRef } from "react";
import { api } from "../services/api";
import socketService from "../services/socketService";
import MessageList from "../components/MessageList";
import usePageVisibility from "../hooks/usePageVisibility";
import useAutoMarkRead from "../hooks/useAutoMarkRead";
import "../styles/Chatbox.css";
import { useDispatch, useSelector } from "react-redux";
import {setMessagesForUser, updateStatusByUsers } from "../redux/features/messagesSlice";


const ChatBox = () => {
// console.log("Rendering ChatBox");
  // Redux 
  const dispatch = useDispatch();

  // Refs
  const scrollRef = useRef(null);

  // Redux state
  const { username } = useSelector((state) => state.user);
  const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);
  usePageVisibility();

  // Socket event listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return; // socket not ready yet

    // ---- socket event listeners ----
    socket.on("messages-read", ({ receiver, messageIds }) => {
      dispatch(updateStatusByUsers({ userId: receiver, status: "read", messageIds }));
    });

    socket.on("messages-delivered", ({ receiver, messageIds }) => {
      console.log("messages-delivered")
      dispatch(updateStatusByUsers({ userId: receiver, status: "delivered", messageIds }));
    });

    return () => {
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
  });

  return (
    <div className="W-chatbox">
      {/* this is the main chat area */}
      <div className="W-chat-main">
        <div ref={scrollRef} className="W-message-container" >
          <MessageList />
        </div>
      </div> 
    </div>
  );
};

export default ChatBox;
