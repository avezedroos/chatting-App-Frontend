import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetUI, setSelectedMessage, setSelectionMode } from "../../redux/features/uiSlice";
import { copyMessages } from "../../utils/copyMessages";
import { selectMessagesByUser } from "../../redux/features/messagesSelectors";
import { getMessageById } from "../../utils/minifunctions";
import { FiTrash2 } from "react-icons/fi";
import { FaRegCopy } from "react-icons/fa";
import { BsPinAngle, } from "react-icons/bs";
import { CgMoreVertical } from "react-icons/cg";
import { pinMessage, unpinMessage } from "../../redux/features/connectionsSlice";
import { selectPinnedMessageIds } from "../../redux/features/connectionSelectors";
import { RiUnpinLine } from "react-icons/ri";
import socketService from "../../services/socketService";

const ActionHeader = ({
  onDelete = () => { },
  onMore = () => { },
}) => {
  const dispatch = useDispatch();

  const selectedMessageIds = useSelector((state) => state.ui.selectedMessage);
  const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);
  const messages = useSelector((state) => selectMessagesByUser(state, otherUser));
  const selectedMessages = getMessageById(selectedMessageIds, messages);
  const pinnedMessageIds = useSelector(selectPinnedMessageIds);
  const isPin = pinnedMessageIds.has(String(selectedMessageIds[0]));



  const onPin = () => {
    if (selectedMessageIds.length !== 1) return;
    // console.log("selectedMessageIds", selectedMessages,)

    if (isPin) {

      socketService.emit("unpinMessage", {
        otherUser: otherUser,
        msgId: selectedMessageIds[0],

      }, (response) => {
        if (response.success) {
          dispatch(
            unpinMessage({
              username: otherUser,
              msgId: response.msgId
            })
          );
          return;
        } else {
          console.log("Pin failed:", response.message);
          return;
        }
      })

    }

    socketService.emit("pinMessage", {
      otherUser: otherUser,
      msgId: selectedMessageIds[0],
      type: "shared", // personal or shared
    },
      (response) => {
        if (response.success) {
          console.log("Pin successful:", response.pin);
          const responseData = response.pin;
          dispatch(
            pinMessage({
              username: otherUser,
              msgId: responseData.msgId,
              type: responseData.type, // personal or shared
              timestamp: responseData.timestamp,
            })
          );

        } else {
          console.log("Pin failed:", response.message);
        }
      }
    );
  }


  const onBack = () => {
    // Implement back action logic here
    dispatch(setSelectionMode({ where: "chatBox", value: false }));
    dispatch(setSelectedMessage({ where: "messages", value: [] }));

  };



  const onCopy = async () => {
    const iscopy = await copyMessages(selectedMessages);

    if (!iscopy.success) {
      alert("Failed to copy messages")
      return;
    }
    alert("Messages copied to clipboard");
    dispatch(resetUI());
  }

  return (
    <div
      className="d-flex align-items-center w-100 chat-action-header"
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
      <span className="fw-bold p-2" style={{
        fontSize: "20px",
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
          style={{ fontSize: "20px", }}
          title="Copy"
        >
          <  FaRegCopy />
        </div>

        {/* PIN BUTTON */}
        {selectedMessageIds?.length === 1 && <div
          className="btn p-0"
          onClick={onPin}
          style={{ fontSize: "24px" }}
          title="Pin"
        >
          {isPin ? <RiUnpinLine /> : < BsPinAngle />}
        </div>}

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
