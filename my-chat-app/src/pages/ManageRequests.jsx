import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaUserPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useSelector } from "react-redux";

const ManageRequests = () => {
  const {username} = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("received"); // "received" | "sent"
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); // "All" | "Pending" | "Accepted" | "Rejected" | "Blocked"
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Fetch data from backend
  const getRequests = async () => {
    try {
      setLoading(true);
      const form = {
        username,
        filters: {
          directions: {
            received: ["pending", "accepted"], // you can dynamically update these later
            sent: ["pending", "rejected"],
          },
        },
      };

      const res = await api.post(`/connections/getrequests`, form);
      console.log("getRequests Response:", res.data);

      // ✅ Set results
      if (res.data?.results) {
        setRequests({
          received: res.data.results.received || [],
          sent: res.data.results.sent || [],
        });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // ✅ Choose which requests to display
  const displayedRequests = requests[activeTab] || [];

  // ✅ Apply search + filter
  const filteredRequests = displayedRequests.filter((req) => {
    const matchesSearch = req.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "All" || req.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // ✅ Handle navigation
  const updateState = (where) => {
    if (where === "backButton") navigate(-1);
  };

  const updateRequestStatus = (requestId, newStatus) => {

    try {
      let form = {
        "username": username,
        "targetUsername": requestId,
        "action": newStatus
      };
      console.log("updateRequestStatus form:", form);
      let res = api.post(`/connections/updateconnection`, form);
      console.log("updateRequestStatus Response:", res.data);
      // Refresh requests after update
      getRequests();

    } catch (error) {
      console.error("Error updating request status:", error);
    }
  }

  return (
    <div className="MR-wrapper Background-image">
      {/* Header */}
      <div className="MR-header">
        <button className="MR-back-btn" onClick={() => updateState("backButton")}>
          <FaArrowLeft />
        </button>
        <div>
          <h2>Manage Requests</h2>
          <p>View and manage your connections</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="MR-search-filter">
        <div className="MR-search">
          <FaSearch className="icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            
          />
        </div>
<div className="MR-filter-wrapper">
        <select
          className="MR-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Accepted</option>
          <option>Rejected</option>
          <option>Blocked</option>
        </select>
       <span className="filter-icon">▼</span>
       </div>
      </div>

      {/* Tabs */}
      <div className="MR-tabs">
        <button
          className={activeTab === "received" ? "active" : ""}
          onClick={() => setActiveTab("received")}
        >
          Received
        </button>
        <button
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="MR-loading">Loading requests...</div>
      ) : filteredRequests.length > 0 ? (
        <div className="MR-list">
          {filteredRequests.map((req, index) => (
            <div key={index} className="MR-card">
              <div className="MR-user">
                <img
                  src={`https://ui-avatars.com/api/?name=${req.username}&background=6e2ad8&color=fff`}
                  alt={req.username}
                />
                <div>
                  <h5>@{req.username.toLowerCase()}</h5>
                  <p>
                    {req.status.charAt(0).toUpperCase() +
                      req.status.slice(1)}{" "}
                    • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="MR-actions">
                {activeTab === "received" && req.status === "pending" ? (
                  <>
                    <button className="accept" onClick={() => updateRequestStatus(req.username, "accepted")}>
                      <FaUserCheck /> Accept
                    </button>
                    <button className="reject" onClick={() => updateRequestStatus(req.username, "rejected")}>
                      <FaUserTimes /> Reject
                    </button>
                  </>
                ) : (
                  <button className="cancel" onClick={() => updateRequestStatus(req.username, "cancel")}>
                    <FaUserPlus /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="MR-empty">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
            alt="No Requests"
          />
          <h4>No requests yet</h4>
          <p>Send or receive new connections to see them here.</p>
          <button className="find-btn">Find Friends</button>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;
