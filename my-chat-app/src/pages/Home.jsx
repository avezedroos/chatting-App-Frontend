// Home.jsx
import React, { use, useState } from "react";
import ChatBox from "./ChatBox";
import "../styles/Chatbox.css"; // layout + chat styles (shared)
import InviteFriend from "../components/InviteFriend";
import { useNavigate } from "react-router-dom";
import { formatTimestamp } from "../../../utility/Mini-Function";

export default function Home({ username = "You", connections, token = null ,userdata}) {
    console.log("Home userdata:", userdata);
  const [selected, setSelected] = useState(null);
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const stateUpdateFunction = (data, where ) => {
        console.log("connectionsModalOpen:", connectionsModalOpen, where);
    if (where === "connectionsModal") {
    //   console.log("Updating connections state in Home:", data);
      setConnectionsModalOpen(prev => !prev);
    }
    if (where === "requestsPage") {
      // setConnectionsModalOpen(false);
      navigate("/requests");

    }
}


console.log("Home connections:", connections);
  // Accepts either token prop or pick from localStorage as fallback
  const auth = { username, token: token || localStorage.getItem("token") || "" };

  return (
    <div className="W-app">
      <aside className={`W-sidebar ${selected ? "W-hide-mobile" : ""}`}>
        <div className="W-sidebar-header">
          <div className="W-user">
            <div className="W-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="W-user-info">
              <div className="W-username">{username}</div>
              <div className="W-status">Available</div>
            </div>
          </div>
          <div className="W-sidebar-actions">
            <button
              className="W-Request-btn" onClick={()=>{stateUpdateFunction(null,"requestsPage")}}>
              Request
            </button>
          </div>
        </div>

        <div className="W-search">
          <input
            className="W-search-input"
            placeholder="Search or start new chat"
            onChange={() => {}}
            // keep it simple; you can wire search state here if needed
          />
        </div>

        <div className="W-contacts">
         {connections.length === 0 && (
  <div className="W-empty-state">
    <div className="W-empty-content">
      <div className="W-empty-icon">💬</div>
      <h3 className="W-empty-title">No Chats Yet</h3>
      <p className="W-empty-text">
        Start connecting with someone to begin your first conversation.
      </p>
      <button
        className="W-start-btn"
        onClick={() => {
          // Open sidebar or user search popup
          document.querySelector(".W-search-input")?.focus();
        }}
      >
        Start New Chat
      </button>
    </div>
  </div>
)}


          {connections.map((c,i) => (
            console.log("Rendering contact:", c) ||
            <div
              key={c.id || i}
              className={`W-contact ${selected?.id === c.id ? "W-active" : ""}`}
              onClick={() => setSelected(c)}
              role="button"
            >
              <div className="W-contact-left">
                <div className="W-contact-avatar">{c.avatar ? <img src={c.avatar} alt={c.username} /> : c.username.charAt(0)}</div>
                <div className="W-contact-meta">
                  <div className="W-contact-name">{c.username}</div>
                  <div className="W-contact-last">{c.lastMessage.message || ""}</div>
                </div>
              </div>
              <div className="W-contact-right">
                <div className="W-contact-time">{formatTimestamp(c.lastMessage.time)}</div>
                {c.unread > 0 && <div className="W-unread">{c.unread}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* <div className="W-sidebar-footer">Powered — Purple Chat</div> */}
       <div className="W-add-connection " onClick={()=>{stateUpdateFunction(null,"connectionsModal")}}>

       </div>
        
      </aside>

      <main className={`W-chat-area ${!selected ? "W-hide-mobile" : ""}`}>
        {selected ? (
          <ChatBox auth={auth} otherUser={selected.username || selected.name} onClose={() => setSelected(null)} />
        ) : (
          <div className="W-welcome">
            <div className="W-welcome-art">💜</div>
            <h2>Welcome, {username}!</h2>
            <p>Select a chat to start messaging.</p>
          </div>
        )}
      </main>
{connectionsModalOpen && <InviteFriend userdata={userdata} onClose ={()=>stateUpdateFunction(null,"connectionsModal")}/>}  

    </div>
  );
}
