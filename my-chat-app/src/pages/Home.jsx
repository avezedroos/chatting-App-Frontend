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
import MessageInput from "../components/MessageInput";
import HeaderSwitcher from "../components/Headers/HeaderSwitcher";
import PulseModal from "../modals/PulseModal";

export default function Home() {
  console.log("Rendering Home");
  //redux state
  const { username } = useSelector((state) => state.user);
  const selectedConnection = useSelector((state) => state.connections.selectedConnection);
  const PulseModalData = useSelector((state) => state.ui.PulseModal);
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
  }


  return (
    <div className="W-app">
      <aside className={`W-sidebar Background-image ${selectedConnection ? "W-hide-mobile" : ""}`}>
        <HeaderSwitcher where="Home"/>
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
        <PulseModal />


      </aside>

      <main className={`W-chat-area Background-image ${!selectedConnection ? "W-hide-mobile" : ""}`}>
        {selectedConnection ? (
          <>
          <HeaderSwitcher where="chatBox"/>
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
