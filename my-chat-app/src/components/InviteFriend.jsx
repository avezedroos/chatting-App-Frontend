import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  FaCopy,
  FaShareAlt,
  FaTimes,
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookMessenger,
  FaTwitter,
} from "react-icons/fa";

const InviteFriend = ({ userdata, onClose }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = userdata.inviteCode || "default-code";
    setInviteCode(code);
    setInviteLink(`${window.location.origin}/invite/${code}`);
  }, [userdata]);

  // Copy invite code
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share invite link
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on this app!",
        text: "Use my invite link to connect:",
        url: inviteLink,
      });
    } else {
      alert("Sharing not supported on this device. Use icons below!");
    }
  };

  // Handle sending friend request
  const handleSendRequest = async () => {
    if (!friendCode.trim()) {
      setMessage("Please enter your friend’s invite code.");
      return;
    }

    try {
      setLoading(true);
      const form = { senderCode: inviteCode, receiverCode: friendCode };
      console.log("Sending friend request:", form);
      const res = await api.post(`/connections/add`, form);
      setMessage(res.data.message || "Friend request sent successfully!");
      setFriendCode("");
    } catch (error) {
      console.error("Error sending request:", error);
      setMessage("Error sending request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-content p-3 position-relative">
          {/* Close button */}
          <button
            className="btn-close position-absolute top-0 end-0 m-3"
            onClick={onClose}
          ></button>

          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold text-center w-100">
              Invite a Friend
            </h5>
          </div>

          <div className="modal-body">
            {/* Invite code */}
            <div className="mb-3 text-center">
              <p className="mb-1 fw-semibold">Your Invite Code:</p>
              <div className="d-flex justify-content-center align-items-center gap-2">
                <span className="badge bg-light text-dark fs-6 p-2 px-3">
                  {inviteCode}
                </span>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleCopy}
                >
                  <FaCopy /> Copy
                </button>
              </div>
              {copied && (
                <div className="text-success small mt-1 fade show">
                  ✅ Copied to clipboard!
                </div>
              )}
            </div>

            {/* Invite link */}
            <div className="mb-3 text-center">
              <p className="mb-1 fw-semibold">Your Invite Link:</p>
              <a
                href={inviteLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-break"
              >
                {inviteLink}
              </a>

              <div className="mt-2 d-flex justify-content-center gap-2 flex-wrap">
                <button
                  className="btn btn-sm btn-gradient text-white"
                  onClick={handleShare}
                >
                  <FaShareAlt /> Share
                </button>
                <a
                  href={`https://wa.me/?text=Join%20me!%20${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-success btn-sm"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href={`https://t.me/share/url?url=${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-info btn-sm"
                >
                  <FaTelegramPlane />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <FaTwitter />
                </a>
                <a
                  href={`fb-messenger://share?link=${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <FaFacebookMessenger />
                </a>
              </div>
            </div>

            {/* Friend code input */}
            <div className="mb-3">
              <input
                type="text"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="Enter friend’s invite code"
                className="form-control"
              />
            </div>

            <div className="d-grid">
              <button
                className="btn btn-gradient text-white fw-semibold"
                onClick={handleSendRequest}
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                ) : null}
                Send Friend Request
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="alert alert-info mt-3 fade show" role="alert">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Add minimal gradient style for buttons
const style = document.createElement("style");
style.innerHTML = `
  .btn-gradient {
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border: none;
    transition: 0.3s;
  }
  .btn-gradient:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
document.head.appendChild(style);

export default InviteFriend;
