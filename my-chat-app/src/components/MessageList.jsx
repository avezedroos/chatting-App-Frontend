import React, { useState, useRef, useEffect } from "react";
import EmojiReactionModal from "../modals/EmojiReactionModal";
import useLongPress from "../hooks/useLongPress";
import { useDispatch, useSelector } from "react-redux";
import { selectMessagesByUser } from "../redux/features/messagesSelectors";
import { addEmojiReaction } from "../redux/features/messagesSlice";
import socketService from "../services/socketService";
import MessageActionModal from "../modals/MessageActionModal";
import { getMessageById } from "../utils/minifunctions";
import { setSelectedMessage, setSelectionMode, startReplying } from "../redux/features/uiSlice";
// 📌 Format date into "Today", "Yesterday", "DD/MM/YYYY"
const formatDayLabel = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-GB");
};

const MessageList = () => {
  // console.log("MessageList is render")
  // Redux
  const dispatch = useDispatch();

  // Redux state
  const currentUser = useSelector((state) => state.user.username);
  const otherUser =useSelector((state) =>state.connections.selectedConnection?.username ||state.connections.selectedConnection?.name);
  const messages = useSelector((state) => selectMessagesByUser(state, otherUser));
  const selectionMode = useSelector((state) => state.ui.selectionMode);
  const selectedMessages = useSelector((state) => state.ui.selectedMessage) ;
// States
  
  const [emojiPosition, setEmojiPosition] = useState(null);
  const [direction, setDirection] = useState("left");
  const [directionX, setDirectionX] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0)
  const [swipeOffset, setSwipeOffset] = useState({}); // 🟣 New state for swipe animation

  // Refs
  const messageRefs = useRef({});
  const containerRef = useRef(null);
  const docClickRef = useRef(null);

// Sort messages by timestamp ascending
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // 🔄 Receive emoji updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on("reaction-updated", (payload) => {
      console.log("reaction-updated", payload)
      const { messageId, reactions, sender, receiver } = payload;

      dispatch(
        addEmojiReaction({
          userID: sender,
          user: receiver,
          messageId,
          reactions
        })
      );
    });

    return () => socket.off("reaction-updated");
  }, [currentUser, dispatch]);

  // ➡️ Swipe to reply
  const handleTouchStart = (e, msg) => {
    if (selectionMode) return;  // ⛔ Stop in selection mode
    if (!e.touches || e.touches.length === 0) return;

    setDirectionX(e.currentTarget.dataset.direction)
    setTouchStartX(e.touches[0].clientX)
  };

  const handleTouchMove = (e, msg) => {
    if (selectionMode) return;  // ⛔ Stop in selection mode
    if (!e.touches || e.touches.length === 0) return;

    const id = msg._id || msg.tempId;
    const diff = e.touches[0].clientX - touchStartX;

    // =========================================
    //  🧠 RULES FOR SWIPE DIRECTION
    // =========================================
    if (directionX === "left" && diff < 0) {
      // ❌ Left bubble → user is swiping left → not allowed
      return;
    }

    if (directionX === "right" && diff > 0) {
      // ❌ Right bubble → user is swiping right → not allowed
      return;
    }

    // =========================================
    //  🧠 APPLY CORRECT SWIPE (towards center)
    // =========================================
    setSwipeOffset((prev) => ({
      ...prev,
      [id]: Math.min(Math.abs(diff), 90) * (diff < 0 ? -1 : 1),
      // LEFT bubble → positive swipe  
      // RIGHT bubble → negative swipe  
    }));
  };


  const handleTouchEnd = (e, msg) => {
    if (selectionMode) return;   // ⛔ stop swipe

    const id = msg._id || msg.tempId;

    let endX = 0;
    if (e.changedTouches && e.changedTouches.length > 0) {
      endX = e.changedTouches[0].clientX;
    }

    const diff = endX - touchStartX;  // positive = right swipe, negative = left swipe

    // =========================================
    // 🧠 CHECK DIRECTION
    // =========================================
    if (directionX === "left") {
      // Left bubble → must swipe RIGHT → diff >= threshold
      if (diff >= 150) {
        handleReply(msg);
      }
    }

    else if (directionX === "right") {
      // Right bubble → must swipe LEFT → diff <= -threshold
      if (diff <= -150) {
        handleReply(msg);
      }
    }

    // =========================================
    // 🎬 SNAP BACK — reset bubble position
    // =========================================
    setSwipeOffset((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };
  // 🟡 Message action handler
  const handleReply = (message) => {
    console.log("handleREply is running ")
    const id = message._id || message.tempId;

    dispatch(
      startReplying({
        id,
        text: message.text,
        sender: message.sender,
      })
    );

    // Reset movement
    setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
  };

  // 🟣 Long Press
  const handleLongPress = (pressedId) => {
    dispatch(setSelectedMessage([pressedId]));
    dispatch(setSelectionMode(true));

    const element = messageRefs.current[pressedId];
    const parent = containerRef.current;

    if (element && parent) {
      const elRect = element.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      setDirection(element.dataset.direction);

      const top =
        elRect.top - parentRect.top + parent.scrollTop - 50;

      const left = elRect.left - parentRect.left + parent.scrollLeft;

      setEmojiPosition({
        top,
        left: left - 20,
      });
    }
  };

  const handleClick = (clickedId) => {
    console.log("handleClick is running");
    if (selectionMode) {
      if (selectedMessages.includes(clickedId)) {
        // Deselect
        const updated = selectedMessages.filter((id) => id !== clickedId);
        dispatch(setSelectedMessage(updated));
        if (updated.length === 0) {
          console.log("no message selected  so turning off selection mode")
          dispatch(setSelectionMode(false));
        }
      } else {
        dispatch(setSelectedMessage([...selectedMessages, clickedId]));
        setEmojiPosition(null);
      }
    }
  };

  const { eventHandlers } = useLongPress(handleLongPress, {
    delay: 600,
    onClick: handleClick,
    selectionMode: selectionMode,
  });

  // 🟡 Emoji selection handler [selectedMessages, messages, currentUser, dispatch,otherUser, resetUI]
  const handleEmojiSelect = (emoji) => {
    if (selectedMessages.length !== 1) return;

    const messageId = selectedMessages[0];

    // Find the message
    const message = messages.find((m) => m._id === messageId);
    if (!message) return;

    // Find if current user already reacted
    const prevReaction = message.reactions?.find(
      (r) => r.user === currentUser
    );

    // console.log("message.reactions",message.reactions,"currentUser",currentUser)
    console.log("prevReaction", prevReaction)

    // Prevent multiple emojis / invalid emoji
    if (emoji && typeof emoji === "string" && [...emoji].length > 2) {
      console.warn("❌ Multiple emojis not allowed");
      return;
    }

    // ======================================================
    // RULE 2 — If same emoji OR emoji=null → REMOVE reaction
    // ======================================================
    if (!emoji || (prevReaction && prevReaction.emoji === emoji)) {
      dispatch(
        addEmojiReaction({
          userID: otherUser,
          user: currentUser,
          messageId,
          emoji: null, // remove
        })
      );

      socketService.emit("update-reaction", {
        messageId,
        user: currentUser,
        emoji: null,
        otherUser: otherUser
      });

      resetUI();
      return;
    }

    // ======================================================
    // RULE 4 — If different emoji → UPDATE reaction
    // ======================================================
    if (prevReaction && prevReaction.emoji !== emoji) {
      dispatch(
        addEmojiReaction({
          userID: otherUser,
          user: currentUser,
          messageId,
          emoji,
        })
      );

      socketService.emit("update-reaction", {
        messageId,
        user: currentUser,
        emoji,
        otherUser: otherUser

      });

      resetUI();
      return;
    }

    // ======================================================
    // RULE 5 — New reaction → ADD
    // ======================================================
    console.log("i am in 5th Rule maybe")
    dispatch(
      addEmojiReaction({
        userID: otherUser,
        user: currentUser,
        messageId,
        emoji,
      })
    );

    socketService.emit("update-reaction", {
      messageId,
      user: currentUser,
      emoji,
      otherUser: otherUser
    });

    resetUI();
  };

  // Helper
  const resetUI = () => {
    console.log("resetUI is running")
    dispatch(setSelectedMessage([]));
    dispatch(setSelectionMode(false));
    setEmojiPosition(null);
  };

  let lastDateLabel = null;


  let longPressTimer = null;   // ⭐ Unified handler so swipe does NOT cancel long press

  const unifiedTouchStart = (e, msg) => {
    if (selectionMode) return;   // ⛔ stop longPress + swipe conflict
    const id = msg._id || msg.tempId;

    longPressTimer = setTimeout(() => {
      eventHandlers.onTouchStart?.({
        ...e,
        currentTarget: messageRefs.current[id], // FIXED
      });
    }, 70);

    handleTouchStart(e, msg);
  };


  const unifiedTouchMove = (e, msg) => {
    if (selectionMode) return;   // ⛔ stop swipe
    clearTimeout(longPressTimer);
    eventHandlers.onTouchMove?.(); // cancel long press
    handleTouchMove(e, msg);
  };

  const unifiedTouchEnd = (e, msg) => {
    if (selectionMode) return;   // ⛔ stop swipe
    clearTimeout(longPressTimer);
    eventHandlers.onTouchEnd?.(e);

    handleTouchEnd(e, msg);
  };
  const is24hr = Intl.DateTimeFormat([], { hour: "numeric" })
    .formatToParts(new Date())
    .some(part => part.type === "dayPeriod") === false;

  const handleOutsideClick = () => {
    console.log("handleOutsideClick is running");
    document.removeEventListener("click", docClickRef.current); // <--- FIX
    docClickRef.current = null;
    setEmojiPosition(null); // closes modals
  };


  useEffect(() => {
    
    if (!(selectedMessages.length === 1 && emojiPosition)) return;
    console.log("useEffect for outside click is running")

    docClickRef.current = (e) => {
      console.log("i am calling handleOutsideClick")
      handleOutsideClick();
    };

    document.addEventListener("click", docClickRef.current);

    return () => {
      console.log("cleanup for outside click is running")
      document.removeEventListener("click", docClickRef.current);
    };
  }, [selectedMessages.length, emojiPosition]);



  return (
    <div ref={containerRef} style={{ position: "relative", paddingBottom: "50px" }}>
      {sortedMessages.map((m) => {
        const id = m._id || m.tempId;
        const isSent = m.sender === currentUser;

        const isDeletedForUser = m.deletedFor?.includes(currentUser);
        const isDeletedForEveryone = m.isDeletedForEveryone;

        const displayText = isDeletedForEveryone
          ? "🗑️ Message deleted for everyone"
          : isDeletedForUser
            ? "🗑️ You deleted this message"
            : m.text;

        const dateLabel = formatDayLabel(m.timestamp);
        const showDateLabel = dateLabel !== lastDateLabel;
        if (showDateLabel) lastDateLabel = dateLabel;

        const isSelected = selectedMessages.includes(id);

        const bubbleStyle = {
          background: isSent?"var(--sent-message-bubble-bg)":"var(--received-message-bubble-bg)",
          color:isSent?"var(--sent-message-bubble-text)":"var(--received-message-bubble-text)",
          boxShadow:isSent?"var(--sent-message-bubble-shadow)":"var(--received-message-bubble-shadow)",
          border:isSent?"var(--sent-message-bubble-border)":"var(--received-message-bubble-border)",
          borderRadius:isSent?"var(--sent-message-bubble-radius)":"var(--received-message-bubble-radius)",

        };

        const animationClass = isSent ? "msg-animate-right" : "msg-animate-left";



        return (
          <React.Fragment key={id}>
            {showDateLabel && (
              <div className="text-center my-3">
                <span
                  style={{
                    background: "var(--DateLabel-bg)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    color:"var(--DateLabel-text)",
                    userSelect: "none"
                  }}
                >
                  {dateLabel}
                </span>
              </div>
            )}

            <div
              className={`d-flex flex-column ${isSent ? "align-items-end" : "align-items-start"
                }`}
                style={{background:`${isSelected?"var( --selected-message-color)":""}`}}
            >
              {/* MESSAGE BUBBLE */}
              <div
                {...eventHandlers}
                onTouchStart={(e) => unifiedTouchStart(e, m)}
                onTouchMove={(e) => unifiedTouchMove(e, m)}
                onTouchEnd={(e) => unifiedTouchEnd(e, m)}

                ref={(el) => (messageRefs.current[id] = el)}
                data-id={id}
                data-direction={isSent ? "right" : "left"}
                className={`py-2 px-3 my-2 fw-bold message-bubble-Style ${animationClass}`}
                style={{
                  ...bubbleStyle,
                  transform: `translateX(${swipeOffset[id] || 0}px) scale(${1 - Math.min((swipeOffset[id] || 0) / 1000, 0.03)})`,
                  opacity: 1 - Math.min((swipeOffset[id] || 0) / 300, 0.3),
                  transition: swipeOffset[id] === 0 ? "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                  position: "relative",
                }}
              >


                {m.replyTo && (
                  <div
                    className="border-start ps-1 my-1"
                    style={{ fontSize: "0.8rem", color: "#555",userSelect: "none" }}
                  >
                    {m.replyTo.text || "previous message"}
                  </div>
                )}

                {/* 🟣 Swipe Arrow (WhatsApp-style) */}
                <div
                  className="swipe-reply-arrow"
                  style={{
                    position: "absolute",
                    left: "-28px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px",
                    opacity: (swipeOffset[id] || 0) > 10 ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  ↩
                </div>

                <div style={{ userSelect: "none" }}>{displayText}</div>

                {m.reactions?.length > 0 && (
                  <div className="mt-1">
                    {m.reactions.map((r, idx) => (
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
                  <div style={{ userSelect: "none" }}>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: is24hr
                    })}
                  </div>

                  {isSent && (
                    <>
                      {m.status === "pending" && (
                        <i className="bi bi-clock" style={{ fontSize: "0.9rem", color: "gray", userSelect: "none" }}></i>
                      )}
                      {m.status === "sent" && <span style={{ color: "gray", userSelect: "none" }}>✔</span>}
                      {m.status === "delivered" && <span style={{ color: "gray", userSelect: "none" }}>✔✔</span>}
                      {m.status === "read" && <span style={{ color: "#0d6efd", userSelect: "none" }}>✔✔</span>}
                    </>
                  )}

                  {m.isEdited && <span style={{ userSelect: "none" }} >(edited)</span>}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {selectedMessages.length === 1 && emojiPosition && (

        <div onClick={(e) => e.stopPropagation()}>
          <EmojiReactionModal
            position={emojiPosition}
            direction={direction}
            onSelect={handleEmojiSelect}
          />

          <MessageActionModal
            position={emojiPosition}
            direction={direction}
            selectedMessages={getMessageById(selectedMessages[0], messages)}
            closeModal={() => resetUI()}
          />
        </div>


      )}
  {/* {actionheader &&<div className="overlay" onClick={(e) => e.stopPropagation()} ></div>} */}

    </div>
  );
};

export default MessageList;
