import React, { useState, useEffect } from "react";
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { api } from "../services/api";
import {
  FaCopy,
  FaShareAlt,
  FaTimes,
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookMessenger,
  FaTwitter,
  FaUserFriends,
  FaLink,
  FaPaperPlane,
  FaEllipsisH,
  FaUserPlus,
} from "react-icons/fa";
import { useSelector } from "react-redux";

import "../styles/InviteFriend.css";

const InviteFriend = ({ onClose }) => {
  const inviteCode = useSelector((state) => state.user.invitecode);

  const [inviteLink, setInviteLink] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      setInviteLink(`https://unknowne.vercel.app/invite/${inviteCode}`);
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
  try {
    const shareData = {
      title: "Join me on this app!",
      text: "Use my invite link to connect:",
      url: inviteLink,
      dialogTitle: "Share Invite Link",
    };

    if (Capacitor.isNativePlatform()) {
      // Android APK: Use native Android sharing
      await Share.share(shareData);
    } else if (navigator.share) {
      // Website: Use browser's native sharing
      await navigator.share(shareData);
    } else {
      // Unsupported browser: Copy link
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied!");
    }

  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Share error:", error);
    }
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

      const form = {
        senderCode: inviteCode,
        receiverCode: friendCode,
      };

      console.log("Sending friend request:", form);

      const res = await api.post("/connections/add", form);

      setMessage(
        res.data.message || "Friend request sent successfully!"
      );

      setFriendCode("");
    } catch (error) {
      console.error("Error sending request:", error);
      setMessage("Error sending request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invitePremium-overlay">
      <div
        className="modal d-block invitePremium-modal"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitePremium-title"
      >
        <div className="modal-dialog modal-dialog-centered invitePremium-dialog">
          <div className="modal-content invitePremium-content">

            {/* Header */}
            <div className="invitePremium-header">
              <div className="invitePremium-header-icon">
                <FaUserFriends />
              </div>

              <div className="invitePremium-heading">
                <h2 id="invitePremium-title">
                  Invite a Friend
                </h2>

                <p>
                  Share this invite to start chatting
                  together instantly.
                </p>
              </div>

              <button
                type="button"
                className="invitePremium-close"
                onClick={onClose}
                aria-label="Close invite modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="invitePremium-divider" />

            <div className="invitePremium-body">

              {/* Invite Code */}
              <section className="invitePremium-section">
                <div className="invitePremium-label">
                  <FaLink />
                  <span>Your invite code</span>
                </div>

                <div className="invitePremium-code-box">
                  <span className="invitePremium-code">
                    {inviteCode}
                  </span>

                  <button
                    type="button"
                    className={`invitePremium-copy-btn ${
                      copied ? "is-copied" : ""
                    }`}
                    onClick={handleCopy}
                    disabled={!inviteCode}
                  >
                    <FaCopy />
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                {copied && (
                  <div
                    className="invitePremium-copy-feedback"
                    role="status"
                  >
                    Invite code copied to clipboard!
                  </div>
                )}
              </section>

              {/* Social Sharing */}
              <section className="invitePremium-section invitePremium-share-section">
                <div className="invitePremium-label">
                  <FaShareAlt />
                  <span>Share with friends</span>
                </div>

                <div className="invitePremium-social-grid">

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Join me! ${inviteLink}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="invitePremium-social-item"
                    aria-label="Share via WhatsApp"
                  >
                    <span className="invitePremium-social-icon whatsapp">
                      <FaWhatsapp />
                    </span>
                    <span className="invitePremium-social-name">
                      WhatsApp
                    </span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      inviteLink
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="invitePremium-social-item"
                    aria-label="Share via Telegram"
                  >
                    <span className="invitePremium-social-icon telegram">
                      <FaTelegramPlane />
                    </span>
                    <span className="invitePremium-social-name">
                      Telegram
                    </span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      inviteLink
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="invitePremium-social-item"
                    aria-label="Share via X"
                  >
                    <span className="invitePremium-social-icon twitter">
                      <FaTwitter />
                    </span>
                    <span className="invitePremium-social-name">
                      X
                    </span>
                  </a>

                  <a
                    href={`fb-messenger://share?link=${encodeURIComponent(
                      inviteLink
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="invitePremium-social-item"
                    aria-label="Share via Messenger"
                  >
                    <span className="invitePremium-social-icon messenger">
                      <FaFacebookMessenger />
                    </span>
                    <span className="invitePremium-social-name">
                      Messenger
                    </span>
                  </a>

                  <button
                    type="button"
                    className="invitePremium-social-item invitePremium-more"
                    onClick={handleShare}
                    aria-label="More sharing options"
                  >
                    <span className="invitePremium-social-icon more">
                      <FaEllipsisH />
                    </span>
                    <span className="invitePremium-social-name">
                      More
                    </span>
                  </button>

                </div>
              </section>

              <div className="invitePremium-divider" />

              {/* Friend Code */}
              <section className="invitePremium-section invitePremium-friend-section">
                <div className="invitePremium-label">
                  <FaUserPlus />
                  <span>Have a friend's code?</span>
                </div>

                <p className="invitePremium-helper">
                  Enter your friend's invite code to send
                  a request.
                </p>

                <div className="invitePremium-input-wrap">
                  <FaLink className="invitePremium-input-icon" />

                  <input
                    type="text"
                    value={friendCode}
                    onChange={(e) => setFriendCode(e.target.value)}
                    placeholder="Enter friend's invite code"
                    className="form-control invitePremium-input"
                    aria-label="Friend's invite code"
                  />
                </div>
              </section>

              {/* Send Request */}
              <button
                type="button"
                className="invitePremium-submit"
                onClick={handleSendRequest}
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <FaPaperPlane />
                )}

                <span>
                  {loading
                    ? "Sending Request..."
                    : "Send Friend Request"}
                </span>
              </button>

              {/* API / Validation Message */}
              {message && (
                <div
                  className="invitePremium-message"
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}

              {/* Footer */}
              <div className="invitePremium-footer">
                <span />
                <p>Invite someone new to Unknown</p>
                <span />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriend;