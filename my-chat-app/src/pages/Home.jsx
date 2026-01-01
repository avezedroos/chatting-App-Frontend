// Home.jsx
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "../styles/Chatbox.css"; // layout + chat styles (shared)
import InviteFriend from "../modals/InviteFriend";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import socketService from "../services/socketService";
import setupSocketEvents from "../services/socketEventsListener";
import ConnectionsList from "../components/ConnectionsList";
import { useWhyRender } from "../hooks/useWhyDidYouUpdate";
import ThemeToggle from "../components/themetogglebtn";
import MessageInput from "../components/MessageInput";
import HeaderSwitcher from "../components/Headers/HeaderSwitcher";

export default function Home() {
  console.log("Rendering Home");
  //redux state
  const { username } = useSelector((state) => state.user);
  const selectedConnection = useSelector((state) => state.connections.selectedConnection);

  //local State
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);

  useWhyRender("Home",null, { connectionsModalOpen, selectedConnection, username });
  const navigate = useNavigate(); // for navigation
  const dispatch = useDispatch(); // to dispatch actions if needed



  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return
    };
    socketService.setToken(token);  // ✔️ set token only once
    socketService.connect();        // ✔️ connect only once
    setupSocketEvents(dispatch)
    return () => socketService.disconnect();

  }, []);

  const stateUpdateFunction = (data, where) => {

    if (where === "connectionsModal") {
      setConnectionsModalOpen(prev => !prev);
    }
    if (where === "requestsPage") {
      navigate("/requests");

    }
  }


  return (
    <div className="W-app">
      <aside className={`W-sidebar Background-image ${selectedConnection ? "W-hide-mobile" : ""}`}>
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
              className="W-Request-btn" onClick={() => { stateUpdateFunction(null, "requestsPage") }}>
              Request
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="W-search">
          <input
            className="W-search-input"
            placeholder="Search or start new chat"
            onChange={() => { }}
          // keep it simple; you can wire search state here if needed
          />
        </div>
        <ConnectionsList />


        <button className="W-add-connection " onClick={() => { stateUpdateFunction(null, "connectionsModal") }}>
        +
        </button>


      </aside>

      <main className={`W-chat-area Background-image ${!selectedConnection ? "W-hide-mobile" : ""}`}>
        {selectedConnection ? (
          <>
          <HeaderSwitcher/>
          <ChatBox/>
          
          <MessageInput />
        
          
        </>
        ) : (
          <div className="W-welcome">
            <div className="W-welcome-art">💜</div>
            <h2 style={{color:'var(--primary-text-color)'}}>Welcome, {username}!</h2>
            <p style={{color:'var(--secondary-text-color)'}}>Select a chat to start messaging.</p>
          </div>
        )}
      </main>
      {connectionsModalOpen && <InviteFriend onClose={() => stateUpdateFunction(null, "connectionsModal")} />}

    </div>
  );
}
