import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTempMessage, editMessage, replaceTempMessage } from "../redux/features/messagesSlice";
import socketService from "../services/socketService";
import { cancelEdit, stopReplying } from "../redux/features/uiSlice";
import { useWhyRender } from "../hooks/useWhyDidYouUpdate";
import { updateLastMessage } from "../redux/features/connectionsSlice";

const MessageInput = () => {
// console.log("Rendering MessageInput");
  // Redux
  const dispatch = useDispatch();

  // Redux state
  const { username } = useSelector((state) => state.user);
  const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);
  const { isReplying } = useSelector((state) => state.ui);
  const { edit } = useSelector((state) => state.ui);

  // Local state
  const [text, setText] = useState("");

  // Refs
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);
  const unsentQueueRef = useRef([]);

  // useWhyRender("MessageInput",null ,{username, otherUser, isReplying, edit ,text}, );
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
    return () => {
      socket.off("connect");
    };

  }, [otherUser]);

  // Handle sending message
  const handleSend = (text, isReplying) => {
    console.log("handleSend called with text:", text, "isReplying:", isReplying);
    if (!text.trim()) return;
    const tempId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      tempId,
      sender: username,
      receiver: otherUser,
      text: text.trim(),
      timestamp: null,
      status: "pending",
      replyTo: isReplying? isReplying : null,
    };
    dispatch(addTempMessage({ userId: otherUser, message: { ...payload, pending: true, delivered: false } }));


    if (socketService.isConnected()) {
      socketService.emit("send-message", payload, (ack) => {
        console.log("ACK received for sent message:", ack);
        if (ack?.status && ack.data?._id) {
          // console.log("ACK received for message:", ack);
          dispatch(replaceTempMessage({ userId: otherUser, tempId, newMessage: ack.data }));
          dispatch(updateLastMessage({
            username: otherUser,
            message: ack.data.text,
            time: ack.data.timestamp,
            msgId: ack.data._id,
            match: false,
          }));
        } else {
          unsentQueueRef.current.push(payload);
        }
      });
    } else {
      unsentQueueRef.current.push(payload);
      console.warn("Socket disconnected. Message queued.");
    }
  };

  const handleEdit = ({ messageId, newText }) => {
    // Implement edit message logic here
    if (!newText.trim()) return;
    const payload = {
      messageId: messageId,
      newText: newText
    };
    const ReducerPayload = {
       username: otherUser,
        messageId: messageId,
        newText: newText,
        isEdited: true,
        editedAt: new Date().toISOString(),
    }

    if (socketService.isConnected()) {
      socketService.emit("edit-Message", payload );
      dispatch(editMessage(ReducerPayload));
      dispatch(updateLastMessage({
      username: otherUser,
      message: newText,
      time: new Date().toISOString(),
      msgId: messageId,
      match: true,
    }));
    
      dispatch(cancelEdit());
      
    }
  }

  const handleTyping = (isTyping) => {
    const socket = socketService.getSocket();
    if (!socket) return;
    if (isTyping) {
      socketService.emit("typing", { from: username, to: otherUser, isTyping: true });
    }
  };

  // Autofocus input when reply box appears
  useEffect(() => {
    if (isReplying.id || edit) {
      const input = document.getElementById("chat-input-box");
      if (input) {
        input.focus();

        if (edit) {
          console.log("Setting edit text:", edit);
          setText(edit.text);
        }
      }
    }
  }, [isReplying, edit]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      handleTyping(true);
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
    }, 2000);
  };

  const cancelEditfunc = () => {
    dispatch(cancelEdit());
    setText("");
  }

  const send = () => {
    if (!text.trim()) return;
    if (edit) {
      handleEdit({ messageId: edit._id, newText: text.trim() });
    } else {
      console.log("Sending message:", "in reply to:", isReplying?.id || null);
      handleSend(text.trim(), isReplying?.id || null); // ✔ send reply reference
    }
    setText("");

    // ✔ stop typing indicator immediately
    typingRef.current = false;
    handleTyping(false);

    // ✔ clear reply UI in parent
    if (isReplying?.id) {
      dispatch(stopReplying())
    }
  };

  return (
    <div className="h-100" >

      {/* ⭐ REPLY PREVIEW BOX */}
      {isReplying?.id && (
        <div
          style={{
            background: "var(--primary-highlight-color)",
            padding: "6px 10px",
            borderLeft: "3px solid #8d49ff",
            borderRadius: 6,
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <small style={{ opacity: 0.6 }}>Replying to:</small>
            <div style={{ fontWeight: 600 }}>{isReplying?.text}</div>
          </div>

          {/* ❌ Close reply */}
          <button
            onClick={() => {
              dispatch(stopReplying());
            }}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>
      )}

      {/* ⭐ INPUT ROW */}
      <div style={{ display: "flex", padding: "0px", height: "100%" }}>
        <input
          id="chat-input-box"
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
          className="m-1"
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{
            flex: 1,
            minWidth: 0,          // <-- prevents overflow
            padding: "6px 12px",
            borderRadius: "30px",
            border: "1px solid #ccc",
           background:"var(--primary-highlight-color)",
            color:"var(---primary-text-color)",
            outline: "none",
            fontSize: 16,
          }}
        />

        <button
          onClick={send}
          className="m-1"
          style={{
            padding: "6px 14px",
            border: "none",
            borderRadius: "30px",
            display: "flex", alignItems: "center",
            cursor: "pointer",
          }}
        >
          Send
        </button>

        {edit && <button
          onClick={cancelEditfunc}
          className="m-1"
          style={{
            padding: "6px 14px",
            border: "none",
            borderRadius: "20px",
            display: "flex", alignItems: "center",
            cursor: "pointer",
          }}
        >
          X
        </button>
        }
      </div>
    </div>
  );
};

export default MessageInput;
