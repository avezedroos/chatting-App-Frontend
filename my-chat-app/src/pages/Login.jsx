import React, { useState } from "react";
import { api, setAuthToken } from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import { setConnections } from "../redux/features/connectionsSlice";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const inviteToken = sessionStorage.getItem("inviteToken"); // pulled once

  // Username validation
  const handleUsernameChange = (e) => {
    let value = e.target.value.toLowerCase().replace(/[^a-z]/g, "").slice(0, 15);
    setForm((prev) => ({ ...prev, username: value }));
  };

  const handlePasswordChange = (e) => {
    setForm((prev) => ({ ...prev, password: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";

      // Build payload clean
      const payload = {
        ...form,
        ...( !isLogin && inviteToken ? { inviteToken } : {} )
      };

      const res = await api.post(`/auth/${endpoint}`, payload);

      // Data from server
      const { token, userdata } = res.data;

      // Save auth token
      sessionStorage.setItem("token", token);
      setAuthToken(token);

      // Redux
      dispatch(setUser({ isAuthenticated: true, userdata }));
      dispatch(setConnections(userdata.connections || []));

      // Clear invite token AFTER successful registration
      if (!isLogin && inviteToken) {
        sessionStorage.removeItem("inviteToken");
      }

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
