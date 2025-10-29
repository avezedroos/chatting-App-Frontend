import React, { useState, useRef } from "react";

const MessageInput = ({ onSend, onTyping }) => {
  const [text, setText] = useState("");
  const typingRef = useRef(false);
  let typingTimeout = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      onTyping(false);
    }, 800);
  };

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    // stop typing indicator immediately
    typingRef.current = false;
    onTyping(false);
  };

  return (
    <div className="input-row">
      <input type="text" placeholder="Type a message..." value={text} onChange={handleChange}
        onKeyDown={(e)=> e.key === "Enter" && send()} />
      <button onClick={send} style={{padding:"10px 14px",background:"#007bff",color:"#fff",border:"none",borderRadius:6}}>Send</button>
    </div>
  );
};

export default MessageInput;
