// ConnectionsList.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectConnection } from "../redux/features/connectionsSlice";
import { formatTimestamp } from "../utils/minifunctions";
import useLongPressForConnectionList from "../hooks/useLongPressForConnectionList";
import { setSelectedMessage, setSelectionMode } from "../redux/features/uiSlice";
import { selectOrderedConnections } from "../redux/features/connectionSelectors";



export default function ConnectionsList() {
  const dispatch = useDispatch();
  // console.log("ConnectionsList is render")

  // Redux State
  // const { connections } = useSelector((state) => state.connections);
  const connections = useSelector(selectOrderedConnections);
  console.log("Ordered connections:", connections);
  const selectedConnection = useSelector((state) => state.connections.selectedConnection);
  const { onlineUsers , typing} = useSelector((state) => state.chatMeta);
  const {connectionSelectionMode} = useSelector((state) => state.ui);
  const {selectedConnections} = useSelector((state) => state.ui);
  const {pinnedConnections} = useSelector((state) => state.userSettings.connection);
  
  // 🔵 LOCAL STATE (important)

// 🔹 Helpers
  

  const toggleSelection = (id) => {
  let updated;
  if (selectedConnections.includes(id)) {
    updated = selectedConnections.filter((x) => x !== id);

    // ✅ Last unselect → exit selection mode
    if (updated.length === 0) {
     dispatch(setSelectionMode({where:"connections", value:false}));
    }
  } else {
    updated = [...selectedConnections, id];
    // ✅ First select → enter selection mode
    dispatch(
      setSelectionMode({ where: "connections", value: true })
    );
  }
  dispatch(setSelectedMessage({where:"connections", value:updated}));
};


    const openChat = (id) => {
    const conn = connections.find((c) => c.userId === id);
    if (!conn) return;
    dispatch(selectConnection(conn));
  };

  const { bind} = useLongPressForConnectionList({
    onLongPress: (id) => {
       toggleSelection(id);
    },
  onClick: (id) => {
    if (connectionSelectionMode) {
      toggleSelection(id);
    } else {
      openChat(id);
    }
  },
});


  return (
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
                document.querySelector(".W-search-input")?.focus();
              }}
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}

      {connections.map((c, i) => (
        // console.log(c) ||
        <div
          key={c.userId || i}
          className={`W-contact
             ${selectedConnection?.userId === c.userId ? "W-active" : ""}
             ${selectedConnections.includes(c.userId) ? "W-selected" : ""}
            `}
          role="button"
          {...bind(c.userId)}
        >
          <div className="W-contact-left">
            <div className="W-contact-avatar">

            {/* Avatar */}
              {c.avatar ? <img src={c.avatar} alt={c.username} /> : c.username.charAt(0)}

           {/* Online Dot */}
              {onlineUsers.includes(c.username) && (
                <span
                  className="position-absolute rounded-circle bg-success border border-white"
                  style={{
                    width: "12px",
                    height: "12px",
                    bottom: "0px",
                    right: "0px",
                  }}
                ></span>
              )}

              {/* Typing Indicator */}
  {typing.includes(c.username) && (
  <div className="cloud-typing-indicator">
    <div className="cloud-bubble">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
    {/* <div className="cloud-tail"></div> */}
  </div>
  )}

            </div>

            <div className="W-contact-meta">
              <div className="W-contact-name">{c.username}</div>
              <div className="W-contact-last">{c.lastMessage.message || ""}</div>
            </div>
          </div>

          <div className="W-contact-right">
            <div className="W-contact-time">{formatTimestamp(c.lastMessage.time)}</div>
            {c.unread > 0 && <div className="W-unread">{c.unread}</div>}
            {pinnedConnections.includes(c.userId) && <div className="W-pinned">📌</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
