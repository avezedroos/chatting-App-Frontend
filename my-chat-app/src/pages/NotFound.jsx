import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{
        height: "100vh",
        background: "#f8f9fa",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "120px",
          fontWeight: "700",
          color: "#0d6efd",
          marginBottom: "10px",
        }}
      >
        404
      </h1>

      <h2 className="fw-bold mb-3" style={{ fontSize: "32px" }}>
        Page Not Found
      </h2>

      <p
        style={{
          maxWidth: "450px",
          color: "#6c757d",
          fontSize: "18px",
          lineHeight: "1.6",
        }}
      >
        Sorry! The page you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/"
        className="btn btn-primary mt-3 px-4 py-2"
        style={{
          fontSize: "18px",
          borderRadius: "30px",
          transition: "0.3s",
        }}
      >
        Go Back Home
      </Link>

      {/* Animation */}
      <div
        className="mt-5"
        style={{
          animation: "float 3s ease-in-out infinite",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
          alt="404 Illustration"
          width="180"
        />
      </div>

      {/* Inline Keyframes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
