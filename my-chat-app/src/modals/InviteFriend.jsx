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
import { useSelector } from "react-redux";

const InviteFriend = ({ onClose }) => {
  // const [inviteCode, setInviteCode] = useState("");
  const inviteCode = useSelector((state) => state.user.invitecode);
  // console.log("InviteFriend inviteCode:", inviteCode);
  const [inviteLink, setInviteLink] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
  if (inviteCode) {
    setInviteLink(`${window.location.origin}/invite/${inviteCode}`);
  }
}, [inviteCode]);

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
        backgroundColor: "rgba(0,0,0,0.0)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-content p-2 position-relative " style={{background:"var(--primary-highlight-color)",color:'var(--primary-text-color)'}}>

          {/* Close button */}
          <button
            className="btn-close position-absolute top-0 end-0 m-3"
            onClick={onClose}
          ></button>

          <div className="modal-header border-0 pt-1 pb-0">
            <h5 className="modal-title fw-bold text-center w-100" style={{color:'var(--primary-text-color)'}}>
              Invite a Friend
            </h5>

          </div>

          <div className="modal-body pt-0">
            {/* Invite code */}
            <div className="mb-3 text-center">
            <p className="invite-modal-discription">Share this invite to start chatting together instantly</p>
            <div className="divder"></div>
              <p className="mb-1 fw-semibold ">Your Invite Code:</p>

              <div className="d-flex justify-content-center align-items-center" >
                <div className="rounded-4" style={{background:"var(--primary-highlight-color)" ,display:'inline-flex'}}>
                <span className="badge fs-6 p-2 px-3 ms-1 me-3 " style={{color:"var(--primary-text-color)"}}>
                  {inviteCode}
                </span>
                <button
                  className="btn btn-sm rounded-4 px-3"
                  onClick={handleCopy}
                  style={{color:"var(--primary-text-color)"}}
                >
                  <FaCopy /> Copy
                </button>
                </div>
              </div>

              {copied && (
                <div className="text-success small mt-1 fade show">
                  ✅ Copied to clipboard!
                </div>
              )}
            </div>

            {/* Invite link */}
            <div className="mb-3 text-center">
              <p className="mb-1 fw-semibold"> Invite your friends</p>

              <div className="mt-2 d-flex justify-content-center gap-2 flex-wrap">
                <a
                  href={`https://wa.me/?text=Join%20me!%20${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm share-options"
                  style={{color: "var(--primary-text-color)"}}
                >
                
                  < FaWhatsapp size={22} />
                </a>
                <a
                  href={`https://t.me/share/url?url=${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm share-options"
                   style={{color: "var(--primary-text-color)"}}
                >
                  <FaTelegramPlane size={22}/>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm share-options"
                   style={{color: "var(--primary-text-color)"}}
                >
                  <FaTwitter size={22}/>
                </a>
                <a
                  href={`fb-messenger://share?link=${inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm share-options"
                   style={{color: "var(--primary-text-color)"}}
                >
                  <FaFacebookMessenger size={22}/>
                </a>
                <button
                  className="btn btn-sm rounded-4 px-3 "
                  onClick={handleShare}
                   style={{color: "var(--primary-text-color)", fontWeight:'bold'}}
                >
                  <FaShareAlt size={20}/> More
                </button>
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
                className="btn fw-semibold rounded-md-3 "
                onClick={handleSendRequest}
                disabled={loading}
                style={{color:"var(--primary-text-color)"}}
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
