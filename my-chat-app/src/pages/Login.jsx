import React, { useState } from "react";
import { api, setAuthToken } from "../services/api";

const Login = ({ onAuth }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🔤 Handle username input with restrictions
  const handleUsernameChange = (e) => {
    let value = e.target.value.toLowerCase(); // Convert to lowercase
    value = value.replace(/[^a-z]/g, ""); // Remove non-letter characters
    value = value.slice(0, 15); // Limit to 15 characters
    setForm({ ...form, username: value });
  };

  const handlePasswordChange = (e) => {
    setForm({ ...form, password: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "login" : "register";
      const res = await api.post(`/auth/${endpoint}`, form);
      const { token, username, avatar } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      onAuth({ token, username, avatar });
    } catch (err) {
      alert(err.response?.data?.error || "Authentication error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <h3 style={{ textAlign: "center" }}>Welcome to Two-Person Chat</h3>
      <form onSubmit={submit}>
        <input
          className="mb-2"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          placeholder="Username"
          value={form.username}
          onChange={handleUsernameChange}
        />
        <input
          className="mb-2"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handlePasswordChange}
        />
        <button
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 10 }} className="small">
        <span
          style={{ cursor: "pointer", color: "#007bff" }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "New user? Register" : "Have an account? Login"}
        </span>
      </p>
    </div>
  );
};

export default Login;
