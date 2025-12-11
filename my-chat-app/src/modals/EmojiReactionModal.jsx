import React from "react";
import { motion } from "framer-motion";

const emojis = ["❤️", "😂", "😮", "😢", "👍", "👎"];

const EmojiReactionModal = ({ position, onSelect , direction}) => {
  if (!position) return null;
const Xposition = direction === "left"? position.left:"-20px"

  return (
    <div>
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        top: position.top,
        [direction]: Xposition,
        background: "#2f2f2f",
        borderRadius: "30px",
        padding: "6px 10px",
        display: "flex",
        gap: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      {emojis.map((emoji, index) => (
        <div
          key={index}
          onClick={() => onSelect(emoji)}
          style={{
            fontSize: "1.4rem",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
          onMouseDown={(e) => e.preventDefault()}
          // onTouchStart={(e) => e.preventDefault()}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {emoji}
        </div>
      ))}
    </motion.div>
    </div>
  );
};

export default EmojiReactionModal;
