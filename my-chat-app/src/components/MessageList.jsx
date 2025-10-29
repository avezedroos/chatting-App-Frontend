import React from "react";

const MessageList = ({ messages, currentUser }) => {
  return (
    <>
      {messages.map((m) => (
        <div key={m._id || `${m.sender}-${m.timestamp}`} className={`message ${m.sender === currentUser ? "sent" : "received"}`}>
          <div>{m.text}</div>
          <div className="meta">
            <div>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div>{m.sender === currentUser ? (m.read ? "✔✔" : "✔") : ""}</div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MessageList;
