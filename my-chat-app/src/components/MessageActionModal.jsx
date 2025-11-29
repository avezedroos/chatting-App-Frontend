import React from "react";
import { motion } from "framer-motion";

const actions = [
  { label: "Reply", icon: "↩️" },
  { label: "Add sticker", icon: "😊" },
  { label: "Forward", icon: "📤" },
  { label: "Copy", icon: "📄" },
  { label: "Translate", icon: "🌐" },
  { label: "Unsend", icon: "🗑️", danger: true },
  { label: "More", icon: "⋯" },
];

const MessageActionModal = ({ position, direction, onAction }) => {
  if (!position) return null;

  // position below the emoji modal
  const offset = 55; // height of emoji modal + spacing

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
        background: "#2f2f2f",
        borderRadius: "16px",
        padding: "12px 16px",
        minWidth: "180px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
        zIndex: 999,
      }}
    >
      {actions.map((a, i) => (
        <div
          key={i}
          onClick={() => onAction(a.label)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "0.95rem",
            cursor: "pointer",
            color: a.danger ? "#ff4f4f" : "white",
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
