import React from 'react'
import { RiShareForwardLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { cancelEdit } from '../redux/features/uiSlice';

const EditMessageUI = ({message}) => {
const dispatch = useDispatch();
   const cancelEditfunc = () => {
      dispatch(cancelEdit());
    }
    console.log("edit this message",message)
    const is24hr = Intl.DateTimeFormat([], { hour: "numeric" })
    .formatToParts(new Date())
    .some(part => part.type === "dayPeriod") === false;
    const bubbleStyle = {
          background:  "var(--sent-message-bubble-bg)" ,
          color: "var(--sent-message-bubble-text)",
          boxShadow: "var(--sent-message-bubble-shadow)" ,
          border: "var(--sent-message-bubble-border)" ,
          borderRadius: "var(--sent-message-bubble-radius)",

        };

        const displayText = message.isDeletedForEveryone
          ? "🗑️ Message deleted for everyone"
          : message.isDeletedForUser
            ? "🗑️ You deleted this message"
            : message.text;
  return (
    
    <div className='EditMessageUI '  onScroll={(e) => e.stopPropagation()}>
       <div className="W-chat-header"
      //  style={{}}
       >
            <div className="W-chat-header-left">
                <button className="W-back-btn" onClick={cancelEditfunc}>←</button>
                <div className="W-chat-name">Edit</div>
      
            </div>
            {/* <div className="W-chat-header-right">You: {username}</div> */}
        </div>
{/* MESSAGE BUBBLE */}
              <div
               direction = "right"
                className={`py-2 px-3 mt-2 fw-bold message-bubble-Style msg-animate-right `}
                style={{
                  ...bubbleStyle,
                  position: "relative",
                  marginBottom:'85px',
                  marginRight:'20px',
                }}
              >

                {message.replyTo && (
                  <div
                    className="border-start ps-1 my-1"
                    style={{ fontSize: "0.8rem", color: "#555", userSelect: "none" }}
                    
                  >
                    {message.replyTo.text || "previous message"}
                  </div>
                )}

                {message.isForwarded && (
                  <div
                    className="border-start ps-1 my-1"
                    style={{ fontSize: "0.8rem", color: "#555", userSelect: "none" }}
                    
                  >
                  <RiShareForwardLine />  forwarded
                  </div>
                )}


                <div style={{ userSelect: "none" }}>{displayText}</div>

                {message.reactions?.length > 0 && (
                  <div className="mt-1">
                    {message.reactions.map((r, idx) => (
                      <span key={idx} className="me-1" style={{ userSelect: "none" }}>
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="d-flex align-items-center gap-2 mt-1"
                  style={{ fontSize: "0.75rem", color: "#666" }}
                >
                  {/* {isPinned && <BsPinAngleFill />} */}
                  <div style={{ userSelect: "none" }}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: is24hr
                    })}
                  </div>

                  
                    <>
                      {message.status === "pending" && (
                        <i className="bi bi-clock" style={{ fontSize: "0.9rem", color: "gray", userSelect: "none" }}></i>
                      )}
                      {message.status === "sent" && <span style={{ color: "gray", userSelect: "none" }}>✔</span>}
                      {message.status === "delivered" && <span style={{ color: "gray", userSelect: "none" }}>✔✔</span>}
                      {message.status === "read" && <span style={{ color: "#0d6efd", userSelect: "none" }}>✔✔</span>}
                    </>
                  

                  {/* {message.isEdited && <span style={{ userSelect: "none" }} >(edited)</span>} */}
                </div>
              </div>
              </div>
   
    // </div>
  )
}

export default EditMessageUI