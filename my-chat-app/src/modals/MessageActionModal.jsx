import React, { use } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { startEdit, startReplying } from "../redux/features/uiSlice";
import { copyMessages } from "../utils/copyMessages";
import { canEditMessage } from "../utils/minifunctions";
// import socketService from "../services/socketService";
import { deleteMessagesForEveryone, deleteMessagesForMe } from "../utils/deleteMessages";
// import { send } from "vite";


const BASE_ACTIONS = [
  { label: "Reply", icon: "↩️" },
  { label: "Edit", icon: "📤" },
  { label: "Copy", icon: "📄" },
  { label: "Delete For Me", icon: "🗑️", danger: true },
  { label: "Delete For Everyone", icon: "🗑️", danger: true },
];

const MessageActionModal = ({ position, direction, selectedMessages, closeModal }) => {
  if (!position || !selectedMessages) return null;

  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.username);
  const messageTimestamp = selectedMessages.timestamp;
  const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);



  const editAction = () => {
    dispatch(startEdit(selectedMessages));
  };

  const replyAction = () => {
    const id = selectedMessages._id || selectedMessages.tempId;
    dispatch(
      startReplying({
        id,
        text: selectedMessages.text,
        sender: selectedMessages.sender,
      })
    );
  }

 


  const onAction = (actionLabel) => {
    closeModal();
    // Handle action logic here
    if (actionLabel === "Edit") {
      editAction();
    } else if (actionLabel === "Reply") {
      // Implement reply logic here
      replyAction();
    }
    else if (actionLabel === "Copy") {
      // Implement copy logic here
      copyMessages({ text: selectedMessages.text });
    }
    else if (actionLabel === "Delete For Me") {
      // Implement delete for me logic here
      deleteMessagesForMe(dispatch,selectedMessages._id || selectedMessages.tempId,otherUser);
    }
    else if (actionLabel === "Delete For Everyone") {
        deleteMessagesForEveryone(dispatch,[selectedMessages], username);
    }
  };



  // Filter actions dynamically
  const filteredActions = BASE_ACTIONS.filter((action) => {
    
    if (action.label === "Edit") {
      if (selectedMessages.sender !== username) return false;
      return canEditMessage(messageTimestamp,15); // show only if editable
    }
    if (action.label === "Delete For Everyone") {
      if (selectedMessages.sender !== username) return false;
        return canEditMessage(messageTimestamp,60);// show only if within time limit
    }
    return true;
  });
  const offset = 55;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        top: position.top + offset,
        [direction]: "-10px",
        background: "var(--primary-btn-bg)",
        borderRadius: "16px",
        padding: "12px 16px",
        minWidth: "180px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
        zIndex: 1000,
      }}
    >
      {filteredActions.map((a, i) => (
        <div
          key={i}
          onClick={() => onAction(a.label)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "0.95rem",
            cursor: "pointer",
            color: "var(--primary-text-color)",
            fontWeight:'bold',
            padding: "4px 2px",
            transition: "0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.opacity = "0.7")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.opacity = "1")
          }
        >
          <span style={{ fontSize: "1.2rem" }}>{a.icon}</span>
          <span>{a.label}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default MessageActionModal;
