import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetUI, setSelectedMessage, setSelectionMode } from "../../redux/features/uiSlice";
import { copyMessages } from "../../utils/copyMessages";
import { selectMessagesByUser } from "../../redux/features/messagesSelectors";
import { getMessageById } from "../../utils/minifunctions";
import {  FiTrash2 } from "react-icons/fi";
import {  FaRegCopy } from "react-icons/fa";
import {  BsPinAngle,  } from "react-icons/bs";
import { CgMoreVertical } from "react-icons/cg";

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
    dispatch(setSelectionMode({where:"chatBox", value:false}));
    dispatch(setSelectedMessage({where:"messages", value:[]}));

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
        background: "var(--chat-box-header-bg)",
        borderBottom: "1px solid rgba(229, 229, 229, 0.813)",
        borderRadius: "0px 0px 10px 10px",
        position: "fixed",
        right: "0px",
        top: "0px",
        zIndex: 1000,
        height: "60px",
        padding: "10px",
        width: "100%",
      }}
    >
      {/* BACK BUTTON */}
      <button
        className="center ms-1 me-2 "
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
          color: "var(--primary-text-color)",
          cursor: "pointer",
        }}
      >
        ←
      </button>

      {/* SELECTED MESSAGE COUNT */}
      <span className="fw-bold p-2" style={{ fontSize: "20px",
        color: "var(--primary-color-dark)",
       }}>
        {selectedMessageIds?.length} selected
      </span>

      {/* RIGHT SIDE ICONS */}
      <div
        className="ms-auto d-flex align-items-center px-3 py-0 icon-groups"
        
      >
        {/* COPY BUTTON */}
        <div
          className="btn p-0"
          onClick={() => onCopy()}
          style={{ fontSize: "20px" ,}}
          title="Copy"
        >
          <  FaRegCopy />
        </div>

        {/* PIN BUTTON */}
        <div
          className="btn p-0"
          onClick={onPin}
          style={{ fontSize: "24px" }}
          title="Pin"
        >
< BsPinAngle />
        </div>

        {/* DELETE BUTTON */}
        <div
          className=" p-0 btn" 
          onClick={onDelete}
          style={{ fontSize: "20px", }}
          title="Delete"
        >
         <FiTrash2 />
        </div>

        {/* MORE OPTIONS */}
        <div
          className="btn p-0 me-2"
          onClick={onMore}
          style={{ fontSize: "20px", }}
          title="More"
        >
          <CgMoreVertical />

        </div>
      </div>
    </div>
  );
};

export default ActionHeader;
