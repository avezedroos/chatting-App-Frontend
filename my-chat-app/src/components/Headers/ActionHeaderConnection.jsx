import React, { useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setSelectionMode } from "../../redux/features/uiSlice";
import { useState } from "react";
import { checkPinnedMode } from "../../utils/minifunctions";
import { RiUnpinFill } from "react-icons/ri";
import { pinConnectionThunk } from "../../redux/utils/pinConnectionThunk";
import { BiArchiveOut } from "react-icons/bi";
import {  BsPinAngleFill } from "react-icons/bs";
import { CgMoreVertical } from "react-icons/cg";



export default function SelectionHeader({
  onArchive,
  onClearChat,
  onDeleteChat,
  onBlockUser,
  onReportUser,
  onAutoDelete,
}) {
    const dispatch = useDispatch();
    const {selectedConnections} = useSelector((state) => state.ui);
    const {pinnedConnections} = useSelector((state) => state.userSettings.connection);
    const [isPinnedMode, setIsPinnedMode] = useState(false);
    // console.log("pined connections:",pinnedConnections);

    const onBack = () => {
      // Handle back action (e.g., exit selection mode)
      dispatch(setSelectionMode({where:"connections", value:false}));
    }

    const onPinToggle = async () => {
      // Handle pin/unpin action
      
      dispatch(pinConnectionThunk(selectedConnections));
      // Further logic to pin/unpin the selected connections
     

    }

    useEffect(() => {
  checkPinnedMode(selectedConnections, pinnedConnections, setIsPinnedMode);
}, [selectedConnections, pinnedConnections]);


  return (
    <div className="W-sidebar-header d-flex align-items-center justify-content-between py-2 px-2 px-md-3">
      
      {/* LEFT SECTION */}
      <div className="d-flex align-items-center">
        {/* Back Button */}
        <div
          className="center ms-1 me-2 "
          onClick={onBack}
          style={{
            fontSize: "30px",
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
        </div>

        {/* Selected Counter */}
        <span className="fs-3 fw-semibold ms-2" style={{color:'var(--primary-text-color)'}}>
         {selectedConnections.length}
        </span>
      </div>

      {/* RIGHT SECTION */}
      <div className="icon-groups d-flex align-items-center px-3">

        {/* Pin / Unpin */}
        <div
          className="btn p-0"
          onClick={onPinToggle}
          title={isPinnedMode ? "Unpin Chat" : "Pin Chat"}
          style={{ fontSize: "20px" }}
        >
          {isPinnedMode ?  < BsPinAngleFill />:<RiUnpinFill/>
}
        </div>

        {/* Archive */}
        <div
          className="btn p-0"
          onClick={onArchive}
          title="Archive Chat"
          style={{ fontSize: "20px" }}
        >
          < BiArchiveOut/>
        </div>

      
        {/* 3-Dots Dropdown */}
<Dropdown align="end">
  <Dropdown.Toggle
    as="button"
    variant="light"
    className="selection-action-btn no-caret"
    style={{ fontSize: "20px" }}
  >
    <CgMoreVertical />
  </Dropdown.Toggle>

  <Dropdown.Menu className="selection-dropdown" style={{background:'var(--primary-highlight-color)'}}>
    <Dropdown.Item onClick={onClearChat}>
      Clear Chat
    </Dropdown.Item>

    <Dropdown.Divider />

    <Dropdown.Item onClick={onDeleteChat} className="text-danger">
      Delete Chat
    </Dropdown.Item>

    <Dropdown.Item onClick={onAutoDelete}>
      Auto Delete Chat
    </Dropdown.Item>

    <Dropdown.Divider />

    <Dropdown.Item onClick={onBlockUser} className="text-danger">
      Block User
    </Dropdown.Item>

    <Dropdown.Item onClick={onReportUser}>
      Report User
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>


      </div>
    </div>
  );
}
