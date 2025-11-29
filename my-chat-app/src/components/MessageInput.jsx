import React, { useState, useRef, useEffect } from "react";

const MessageInput = ({ onSend, onTyping, replyingTo, clearReply }) => {
  const [text, setText] = useState("");
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);

  // Autofocus input when reply box appears
  useEffect(() => {
    if (replyingTo){
      const input = document.getElementById("chat-input-box");
      if (input) input.focus();
    }
  }, [replyingTo]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      // onTyping(false);
    }, 2000);
  };

  const send = () => {
    if (!text.trim()) return;

    onSend(text.trim(), replyingTo || null); // ✔ send reply reference
    
    setText("");

    // ✔ stop typing indicator immediately
    typingRef.current = false;
    onTyping(false);

    // ✔ clear reply UI in parent
    if (clearReply) clearReply();
  };

  return (
    <div className="input-area">

      {/* ⭐ REPLY PREVIEW BOX */}
      {replyingTo && (
        <div
          className="reply-box"
          style={{
            background: "#f1d9ff",
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
            <div style={{ fontWeight: 600 }}>{replyingTo.text}</div>
          </div>

          {/* ❌ Close reply */}
          <button
            onClick={clearReply}
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
      <div className="input-row" style={{ display: "flex", gap: 8 }}>
        <input
          id="chat-input-box"
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={send}
          style={{
            padding: "10px 14px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
