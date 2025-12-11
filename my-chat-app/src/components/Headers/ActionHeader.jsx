import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetUI, setSelectionMode } from "../../redux/features/uiSlice";
import { copyMessages } from "../../utils/copyMessages";
import { selectMessagesByUser } from "../../redux/features/messagesSelectors";
import { getMessageById } from "../../utils/minifunctions";
import { a } from "framer-motion/client";

const ActionHeader = ({
  onPin = () => { },
  onDelete = () => { },
  onMore = () => { },
}) => {
  const dispatch = useDispatch();

  const selectedMessageIds = useSelector((state) => state.ui.selectedMessage);
   const otherUser =useSelector((state) =>state.connections.selectedConnection?.username ||state.connections.selectedConnection?.name);
    const messages = useSelector((state) => selectMessagesByUser(state, otherUser));
  const selectedMessages =  getMessageById(selectedMessageIds, messages);

  

  const onBack = () => {
    // Implement back action logic here
    dispatch(setSelectionMode(false));

  };



  const onCopy = async() => {
    const iscopy = await copyMessages(selectedMessages);

    if(!iscopy.success) {
      alert("Failed to copy messages")
      return;
    }
    alert("Messages copied to clipboard");
    dispatch(resetUI());
  }
  return (
    <div
      className="d-flex align-items-center w-100"
      style={{
        background: "var(--primary-dark-background)",
        borderBottom: "1px solid rgba(229, 229, 229, 0.813)",
        borderRadius: "0px 0px 10px 10px",
        position: "fixed",
        right: "0px",
        top: "0px",
        zIndex: 1000,
        height: "66px",
        padding: "10px"
      }}
    >
      {/* BACK BUTTON */}
      <button
        className="center ms-1 me-2"
        onClick={onBack}
        style={{
          fontSize: "30px",
          // lineHeight: "22px",
          height: "80%",
          aspectRatio: "1/1",
          fontWeight: "bold",
          borderRadius: "8px",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ←
      </button>

      {/* SELECTED MESSAGE COUNT */}
      <span className="fw-bold p-2" style={{ fontSize: "20px", border: "1px solid black", borderRadius: "30px",
        color: "var(--primary-color-dark)",
       }}>
        {selectedMessageIds?.length} selected
      </span>

      {/* RIGHT SIDE ICONS */}
      <div
        className="ms-auto d-flex align-items-center px-3"
        style={{ gap: "10px", border: "1px solid black", borderRadius: "30px",background: "var(--primary-color)" }}
      >
        {/* COPY BUTTON */}
        <div
          className="btn p-0"
          onClick={() => onCopy()}
          style={{ fontSize: "20px" }}
          title="Copy"
        >
          📋
        </div>

        {/* PIN BUTTON */}
        <div
          className="btn p-0"
          onClick={onPin}
          style={{ fontSize: "20px" }}
          title="Pin"
        >
          📌
        </div>

        {/* DELETE BUTTON */}
        <div
          className="btn p-0"
          onClick={onDelete}
          style={{ fontSize: "20px", color: "#ff4f4f" }}
          title="Delete"
        >
          🗑
        </div>

        {/* MORE OPTIONS */}
        <div
          className="btn p-0 me-2"
          onClick={onMore}
          style={{ fontSize: "30px", color: "#ccc" }}
          title="More"
        >
          ⋮
        </div>
      </div>
    </div>
  );
};

export default ActionHeader;
