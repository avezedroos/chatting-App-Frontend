import React from "react";

// 🧠 Utility: Format timestamp into label ("Today", "Yesterday", or "DD/MM/YYYY")
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
  return date.toLocaleDateString("en-GB"); // 👈 shows as DD/MM/YYYY
};

const MessageList = ({ messages, currentUser }) => {
  // Sort messages by time (just to be safe)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  let lastDateLabel = null;

  return (
    <>
      {sortedMessages.map((m) => {
        const isSent = m.sender === currentUser;
        const isDeletedForUser = m.deletedFor?.includes(currentUser);
        const isDeletedForEveryone = m.isDeletedForEveryone;

        // 🧾 Determine visible text
        const displayText = isDeletedForEveryone
          ? "🗑️ Message deleted for everyone"
          : isDeletedForUser
          ? "🗑️ You deleted this message"
          : m.text;

        // 🕓 Determine current message's day label
        const currentLabel = formatDayLabel(m.timestamp);

        // 🟣 Render date separator only if new day starts
        const showDateLabel = currentLabel !== lastDateLabel;
        if (showDateLabel) lastDateLabel = currentLabel;

        // ✅ Status icon logic
        const getStatusIcon = () => {
          if (!isSent) return null;
          const style = { fontSize: "1rem", marginLeft: "4px" };
          switch (m.status) {
            case "pending":
              return (
                <i
                  className="bi bi-clock"
                  style={{ ...style, color: "gray", fontSize: "0.9rem" }}
                ></i>
              );
            case "sent":
              return <span style={{ ...style, color: "gray" }}>✔</span>;
            case "delivered":
              return <span style={{ ...style, color: "gray" }}>✔✔</span>;
            case "read":
              return <span style={{ ...style, color: "#0d6efd" }}>✔✔</span>;
            default:
              return null;
          }
        };

        return (
          <React.Fragment key={m._id || m.tempId}>
            {/* 🕒 Date Separator */}
            {showDateLabel && (
              <div
                className="text-center my-3"
                style={{
                  color: "#ccc",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                }}
              >
                <span
                  style={{
                    background: "#2b2b2b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                  }}
                >
                  {currentLabel}
                </span>
              </div>
            )}

            {/* 💬 Message Bubble */}
            <div
              className={`d-flex flex-column my-2 ${
                isSent ? "align-items-end" : "align-items-start"
              }`}
            >
              <div
                className="p-2 rounded-3 shadow-sm"
                style={{
                  maxWidth: "70%",
                  wordWrap: "break-word",
                  backgroundColor: "#d5b1e9",
                  border: isSent ? "none" : "1px solid #eee",
                  color: "#610266",
                  fontWeight: "bold",
                }}
              >
                <div>{displayText}</div>

                {m.replyTo && (
                  <div
                    className="border-start ps-2 mt-1"
                    style={{ fontSize: "0.8rem", color: "#555" }}
                  >
                    ↩️ Replied to: {m.replyTo.text || "previous message"}
                  </div>
                )}

                {m.reactions && m.reactions.length > 0 && (
                  <div className="mt-1">
                    {m.reactions.map((r, i) => (
                      <span key={i} className="me-1">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* 🕒 Time + Status */}
                <div
                  className="d-flex align-items-center gap-2 mt-1"
                  style={{ fontSize: "0.75rem", color: "#666" }}
                >
                  <div>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {getStatusIcon()}
                  {m.isEdited && <div>(edited)</div>}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default MessageList;
