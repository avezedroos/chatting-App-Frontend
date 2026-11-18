import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { clearForwardMessages } from '../../redux/features/uiSlice';

const ForwardHeader = () => {
  const dispatch = useDispatch();
    const selectedConnections = useSelector((state) => state.ui.selectedConnectionsForforwardMessage);

     const onBack = () => {
          // Implement back action logic here
          dispatch(clearForwardMessages());
      
        };
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
        {selectedConnections.length} selected
      </span>

      {/* RIGHT SIDE ICONS */}
      {/* <div
        className="ms-auto d-flex align-items-center px-3 py-0 icon-groups"
      > */}

       

        
        {/* <div
          className=" p-0 btn"
          onClick={onDelete}
          style={{ fontSize: "20px", }}
          title="Delete"
        >
          <FiTrash2 />
        </div> */}

        
        
      {/* </div> */}
    </div>
  )
}

export default ForwardHeader